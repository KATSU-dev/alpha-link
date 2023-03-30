import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IChallenge } from '../combat-structures';
import { MqttService } from '../mqtt.service';
import { getScannedMon, vpet, vpet_lengths, vpet_name_to_commtype } from '../rom-core';
import { convertSerialResponse, INERTROMS } from '../rom-manager';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';
import { IPartner } from '../user-structures';

@Component({
  selector: 'app-create-challenge',
  templateUrl: './create-challenge.component.html',
  styleUrls: ['./create-challenge.component.css']
})
export class CreateChallengeComponent implements OnInit, AfterViewInit {
  @Input('isGlobal') isGlobal: boolean = true;
  @Input('target') target_user: string = "";
  private challenge!: IChallenge;
  private completed: boolean = false;
  public sliderIndex: number = 0;

  constructor(public http: HttpClient,
    public session: SessionService,
    public serial: SerialService,
    private dialogRef: MatDialogRef<CreateChallengeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
      dialogRef.afterClosed().subscribe(result => {
        if(!this.completed) this.serial.closePort();
      });
    }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {    
    this.serialSetup();
    setTimeout(() => { 
      this.sendLegacyInertCode()
        .then(() => this.getDigiROM()
          .then(ROM => this.digiROMAcquired(ROM)));
    }, 1000);
  }
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
    this.sliderIndex = (this.sliderIndex + 1) % 2;
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
    this.generateChallenge(ROM);
    this.sendChallenge();
  }

  private generateChallenge(ROM: string) {
    const mon = getScannedMon((this.session.myUser.partner as IPartner).rom, false, (this.session.myUser.partner as IPartner).vpet);
    this.challenge = {
      challenger: this.session.myUser.username,
      title: this.session.myUser.title, 
      target: this.isGlobal ? "challenge/global" :`challenge/user/${this.target_user}`, 
      global: true, 
      accepted: false, 
      type: mon.vpet_type as vpet, 
      bg: this.session.myUser.bg_active as string, 
      mon: mon.name, 
      stage: mon.stage, 
      rom: ROM,
    }
  }

  private sendChallenge() {
    const t = Date.now() + 1200;
    return new Promise((resolve, reject) => {
      this.http.post<{status: string, id: number}>(`https://www.alphalink.app/api/user/createchallenge`, 
                                            {username: this.session.myUsername, challenge: this.challenge},
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (res: {status: string, id: number}) => {
                      console.log("Created Challenge", res);
                      this.challenge.id = res.id;
                      this.session.setUserChallenge(this.challenge);
                      setTimeout(() => this.dialogRef.close(), t - Date.now());
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("ERROR", error);
                      setTimeout(() => this.dialogRef.close(), t - Date.now());
                      reject();
                    },
                  });
    });
  }
}
