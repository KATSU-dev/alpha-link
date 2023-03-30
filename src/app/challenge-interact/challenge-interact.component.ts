import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IChallenge, IChallengeCheck, IChallengeResponse, IChallengeResponseAccepted } from '../combat-structures';
import { MqttService } from '../mqtt.service';
import { getScannedMon, vpet_lengths, vpet_name_to_commtype } from '../rom-core';
import { convertSerialResponse, INERTROMS } from '../rom-manager';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';
import { IPartner } from '../user-structures';

@Component({
  selector: 'app-challenge-interact',
  templateUrl: './challenge-interact.component.html',
  styleUrls: ['./challenge-interact.component.css']
})
export class ChallengeInteractComponent implements OnInit {
  public operation: string;
  public challenge!: IChallenge;
  private completed: boolean = false;
  public sliderIndex: number = 0;

  public showConfirmOneButtons: boolean = true;

  constructor(public session: SessionService,
              public mqtt: MqttService,
              public serial: SerialService,
              private dialogRef: MatDialogRef<ChallengeInteractComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {op: string, challenge?: IChallenge}) {
      this.operation = data.op;
      if(data.challenge) this.challenge = data.challenge;

      this.dialogRef.afterClosed().subscribe(() => {
        if(this.operation.includes("accept")) {
          this.mqtt.disconnectListener(`challenge/${this.challenge.challenger}/${this.session.myUser.username}`);
          // Close serial if needed
          if(!this.completed) this.serial.closePort();
        }
      }); 
    }

  ngOnInit(): void { }

  private async serialSetup() {
    return new Promise(async (resolve, reject) => {
      await this.serial.openPort().catch(console.log);
      await this.serial.initialisePort().catch(console.log);
      await this.serial.listenToSerialPortTwo().catch(console.log);

      this.serial.serial_status.subscribe(status => {
        if(!status) this.dialogRef.close();
      });
      resolve("OK");
    });
  }

  public async next() {
    this.sliderIndex = (this.sliderIndex + 1) % 3;
  }

  public confirmOneClick() {
    if(!this.showConfirmOneButtons) return;
    this.showConfirmOneButtons = false;

    // Check the challenge is available
    this.mqtt.sendAndAwaitResponse(
      `challenge/${this.challenge.challenger}`,
      `challenge/${this.challenge.challenger}/${this.session.myUser.username}`,
      JSON.stringify({message_class: "CC", from: this.session.myUser.username, timestamp: Date.now()} as IChallengeCheck)
    )
      .then((response) => {
        console.log("Confirm Response:", response);
        this.scanAndSendResponse();
      })
      .catch(error => {
        this.dialogRef.close();
        if(error == -1) {
          console.log("User is busy.");
          return;
        }
        console.log("confirmOneClick ERROR", error);
      });
  }

  private sendLegacyInertCode() {
    return new Promise((resolve, reject) => {
      // Make this smarter to know whether to use DMOG or PENOG
      if(this.serial.isPortInitialised) {
        this.serial.sendSerial( `${INERTROMS[vpet_name_to_commtype["DMOG"]]}\n` );
        resolve("OK");
      }
      else {
        const loopRef = setInterval(() => {
          if(!this.serial.isPortInitialised) return;
          this.serial.sendSerial( `${INERTROMS[vpet_name_to_commtype["DMOG"]]}\n` );  
          clearInterval(loopRef);
          resolve("OK");
        }, 250);
      }
    }); 
  }

  private getDigiROM() {
    return new Promise<string>((resolve, reject) => {
      const loop = () => {
        this.serial.getComLine().then(line => {
          const matches = line.match(new RegExp('r', 'g'));
          const len =  matches ? matches.length : 0;

          if(len < vpet_lengths["DMOG"]) loop();
          else resolve(convertSerialResponse(line.replace(" \r", "")));
        });
      }
      loop();
    });
  }

  private digiROMAcquired(ROM: string) {
    this.next();
    this.dialogRef.disableClose = true;
    this.mqtt.sendAndAwaitResponse(
      `challenge/${this.challenge.challenger}`,
      `challenge/${this.challenge.challenger}/${this.session.myUser.username}`,
      JSON.stringify(this.generateChallengeResponse(ROM)),
      60000
    )
      .then((response: string) => {
        const r = JSON.parse(response) as IChallengeResponseAccepted;

        console.log("Opp Responded:", response, r);

        if(r.accepted) {
          this.completed = true;

          const mon = getScannedMon((this.session.myUser.partner as IPartner).rom, false, (this.session.myUser.partner as IPartner).vpet);
          this.session.linkBattleData.response = {
            challenger: this.session.myUser.username,
            title: this.session.myUser.title,
            target: "",
            global: false,
            accepted: false,
            type: (this.session.myUser.partner as IPartner).vpet, 
            bg: this.session.myUser.bg_active, 
            mon: mon.name, 
            stage: mon.stage, 
            rom: ROM,
          }
          this.session.linkBattleData.original_challenge = this.challenge;
          
          this.dialogRef.close(true);
        }
        else {
          this.dialogRef.close(false);
        }

      })
      .catch(error => {
        this.dialogRef.close();
        if(error == -1) {
          console.log("User is busy.");
          return;
        }
        console.log("Error while awaiting: ", error);
      });
  }

  private generateChallengeResponse(ROM: string) {
    const mon = getScannedMon((this.session.myUser.partner as IPartner).rom, false, (this.session.myUser.partner as IPartner).vpet);
    const challengeResponse = {
      message_class: "CR",
      from: this.session.myUser.username,
      title: this.session.myUser.title,
      type: (this.session.myUser.partner as IPartner).vpet, 
      bg: this.session.myUser.bg_active, 
      mon: mon.name, 
      stage: mon.stage, 
      rom: ROM,
      timestamp: Date.now(),
    } as IChallengeResponse;

    console.log("Generated Response: ", challengeResponse);
    return challengeResponse;
  }

  private async scanAndSendResponse() {
    await this.serial.getPort()
      .catch(error => this.dialogRef.close());
    
    this.serialSetup();
    setTimeout(() => {
      this.sendLegacyInertCode()
        .then(() => this.getDigiROM()
        .then(ROM => this.digiROMAcquired(ROM)));
    }, 1000);
    

    this.next();
    console.log("Got Port");
  }

  public cancelClick(destroy: boolean) {
    this.dialogRef.close(destroy);
  }
}
