import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IChallenge, IChallengeResponse } from '../combat-structures';
import { MqttService } from '../mqtt.service';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-challenge-response',
  templateUrl: './challenge-response.component.html',
  styleUrls: ['./challenge-response.component.css']
})
export class ChallengeResponseComponent implements OnInit {
  private completed: boolean = false;
  public fauxChallenge: IChallenge;
  public showButtons: boolean = true;
  private decided: number = -1;

  constructor(public session: SessionService,
              public http: HttpClient,
              public mqtt: MqttService,
              public serial: SerialService,
              private dialogRef: MatDialogRef<ChallengeResponseComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {response: IChallengeResponse}) {
                this.fauxChallenge = {
                  challenger: data.response.from, 
                  title: data.response.title,
                  target: "",
                  global: false,
                  accepted: false,
                  type: data.response.type,
                  bg: data.response.bg,
                  mon: data.response.mon,
                  stage: data.response.stage,
                  rom: data.response.rom,
                }

                this.dialogRef.afterClosed().subscribe(() => {
                  this.mqtt.disconnectListener(`challenge/${this.session.myUser.username}/${this.fauxChallenge.challenger}`);
                  
                  if(!this.completed) this.serial.closePort();
                  
                  if(this.decided < 0) {
                    this.mqtt.sendMessage(`challenge/${this.session.myUser.username}/${this.fauxChallenge.challenger}`, JSON.stringify({
                      accepted: false,
                      timestamp: Date.now()
                    }));
                  }
                }); 
              }

  ngOnInit(): void {
    setTimeout(() => {
      if(this.decided < 0)
        this.decline();
    }, 60000);
  }

  private async serialSetup(closeOnFail: boolean = true) {
    return new Promise(async (resolve, reject) => {
      await this.serial.openPort().catch(console.log);
      await this.serial.initialisePort().catch(console.log);
      await this.serial.listenToSerialPortTwo().catch(console.log);

      this.serial.serial_status.subscribe(status => {
        if(!status && closeOnFail) this.dialogRef.close(false);
      });
      resolve("OK");
    });
  }

  private enforceGetPort() {
    return new Promise((resolve, reject) => {
      try {
          this.serial.getPort()
            .then(() => {
              resolve("OK");
            })
            .catch(() => {
              // Alert user they must connect their com unit
              setTimeout(() => {
                if(this.decided > -1) return reject(-1);
                this.enforceGetPort();
              }, 1000);
            });
      } catch (error) {
        reject(error);
      }
    })
  }

  public async accept() {
    this.showButtons = false;

    // Get serial
    await this.enforceGetPort()
      .catch(error => {
        if(error == -1) return;
        this.dialogRef.close(false);
      });
      
    this.serialSetup(false);

    if( !(await new Promise((resolve, reject) =>  this.serial.serial_status.subscribe(status => resolve(status) )) ) )
      return this.dialogRef.close(false);
      // if !complete, mqtt tell failed

    // Delete challenge from db
    // this.deleteUserChallenge();
    this.session.clearUserChallenge();

    // Tell oppponent
    this.mqtt.sendMessage(`challenge/${this.session.myUser.username}/${this.fauxChallenge.challenger}`, JSON.stringify({
      accepted: true,
      timestamp: Date.now()
    }));

    this.session.linkBattleData.original_challenge = this.session.challenge;
    this.session.linkBattleData.response = this.fauxChallenge;

    // Close
    this.completed = true;
    this.decided = 1;
    this.dialogRef.close(true);
  }

  private deleteUserChallenge() {
    return new Promise((resolve, reject) => {
      this.http.post('https://www.alphalink.app/api/user/deletechallenge', 
                                            {username: this.session.myUsername, challengeid: this.session.challenge.id}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (res) => {
                      console.log("Challenge removed from DB");
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("Failed to delete challenge", error);
                      reject();
                    },
                  });
    });
  }
  
  public decline() {
    this.showButtons = false;

    this.mqtt.sendMessage(`challenge/${this.session.myUser.username}/${this.fauxChallenge.challenger}`, JSON.stringify({
      accepted: false,
      timestamp: Date.now()
    }));
    this.decided = 0;
    this.dialogRef.close(false);
  }
}
