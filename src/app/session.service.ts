import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ChallengeResponseComponent } from './challenge-response/challenge-response.component';
import { IChallenge, IChallengeCheck, IChallengeMessage, IChallengeResponse, ILinkBattleData } from './combat-structures';
import { MqttService } from './mqtt.service';
import { Tokens } from './tokens'
import { IPartner, User } from './user-structures';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  public isMobile: boolean = false;
  public showSideBar: boolean = false;

  public myUsername!: string;
  public myUser!: User;
  public tokens: Tokens; 
  
  public challenge!: IChallenge;
  public canEnlist: boolean = false;

  public isChallengeAutoUpdate: boolean = false;
  public isChallengeInConnection: boolean = false;

  public sidebarSubject: Subject<number> = new Subject();
  public sidebarSelected: number = 0;

  public showTopBar: boolean = false;
  public topBarSubject: Subject<{event: "ENTER"} | {event: "KEYPRESS", data: string}> = new Subject();
  public showTopBarSearch: boolean = true;
  public topBarPlaceholderText: string = "Search";

  public linkBattleData: ILinkBattleData = {original_challenge: {} as unknown as IChallenge, response: {} as unknown as IChallenge};

  constructor(private http: HttpClient,
              private mqtt: MqttService,
              private dialog: MatDialog,
              private router: Router) {
    this.tokens = new Tokens('', '', http);
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public setUser(user: User) {
    // If the partner is OLD, clear it
    if(typeof user.partner === 'string') {
      if( (JSON.parse(user.partner) as IPartner).expires < Date.now() )
        this.clearUserPartner();
    }

    this.myUser = new User( user.id, user.username, user.email, user.wearing, 
      user.wardrobe, user.xp, user.clas, user.rank, 
      user.wins, user.loss, user.currency, user.profile_text,
      user.faction, user.born, user.last_seen, user.battle_ready, 
      user.title, user.titles, user.settings, user.blocked, 
      user.partner, user.bg_set, user.bg_active )

    this.getUserChallenge()
      .then(hasChallenge => {
        if( ( hasChallenge && !this.hasPartner() )
              ||  // Has a challenge+no partner, or has expired challenge
            ( this.challenge != undefined && this.challenge.timestamp !== undefined && this.challenge.timestamp < (Date.now() - 660000) ) ) {
              this.clearUserChallenge();
            }
        else this.checkCanEnlist();
      });
  }

  public setUserPartner(partner: IPartner) {
    this.myUser.partner = partner;
    this.checkCanEnlist();
  }
  private clearUserPartner() {
    return new Promise((resolve, reject) => {
      this.http.post<{status: string, failed?: string}>('https://www.alphalink.app/api/user/updateuserfields', 
                                            {username: this.myUsername, partner: "{}"}, 
                                            {headers: {Authorization: `Bearer ${this.tokens.access_token}`}})
        .subscribe({
          next: (res: {status: string, failed?: string}) => {
            console.log("Clear User Partner", res);
            if(this.hasPartner()) this.myUser.partner = {} as unknown as IPartner;
            this.checkCanEnlist();
            resolve("OK");
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });
    });
  }

  private getUserChallenge() {
    return new Promise((resolve, reject) => {
      this.http.post<Array<IChallenge>>('https://www.alphalink.app/api/user/getchallengebyusername', 
                                            {username: this.myUsername}, 
                                            {headers: {Authorization: `Bearer ${this.tokens.access_token}`}})
                  .subscribe({
                    next: (challenge: Array<IChallenge>) => {
                      if(challenge.length > 0) {
                        this.setUserChallenge(challenge[0]);
                        return resolve(true);
                      }
                      return resolve(false);
                    },
                    error: (error: any) => {
                      console.log("ERROR", error);
                      reject();
                    },
                  });
    });
  }
  public userChallengeResponseListener = (message: string) => {
    const m = JSON.parse(message) as IChallengeMessage;
    console.log("F GOT", message, m, this.isChallengeInConnection);

    if(this.isChallengeInConnection) return;  // Sorry but can't talk right now
    
    switch(m.message_class) {
      case "CC": {
        const mm = JSON.parse(message) as IChallengeCheck;
        this.mqtt.sendMessage(`challenge/${this.myUser.username}/${mm.from}`,
                              JSON.stringify({from: this.myUser.username, timestamp: Date.now}) );
        console.log("Got CC", mm);
        break;
      }
      case "CR": {
        const mm = JSON.parse(message) as IChallengeResponse;          
        
        this.isChallengeInConnection = true;
        
        this.dialog.open(ChallengeResponseComponent, {
          width: '632px',
          minHeight: '288px',
          data: {response: mm},
          panelClass: 'custom-container',
          disableClose: true,
          closeOnNavigation: false
        }).afterClosed().subscribe((accepted: boolean) => {
          if(accepted) {  // If accepted, go into linkbattle
            this.clearUserChallenge();
            this.router.navigate(['/', 'linkbattle']);
          }                       
          else {}                               // If rejected, continue listening

          this.isChallengeInConnection = false; // In either case, reset isChallengeInConnection
        });

        console.log("Got CR", mm);
        break;
      }
    }
  }
  public setUserChallenge(challenge: IChallenge) {
    this.challenge = challenge;
    
    // const f = (message: string) => {
    //   const m = JSON.parse(message) as IChallengeMessage;
    //   console.log("F GOT", message, m, this.isChallengeInConnection);

    //   if(this.isChallengeInConnection) return;  // Sorry but can't talk right now
      
    //   switch(m.message_class) {
    //     case "CC": {
    //       const mm = JSON.parse(message) as IChallengeCheck;
    //       this.mqtt.sendMessage(`challenge/${this.myUser.username}/${mm.from}`,
    //                             JSON.stringify({from: this.myUser.username, timestamp: Date.now}) );
    //       console.log("Got CC", mm);
    //       break;
    //     }
    //     case "CR": {
    //       const mm = JSON.parse(message) as IChallengeResponse;          
          
    //       this.isChallengeInConnection = true;
          
    //       this.dialog.open(ChallengeResponseComponent, {
    //         width: '632px',
    //         minHeight: '288px',
    //         data: {response: mm},
    //         panelClass: 'custom-container',
    //         disableClose: true,
    //         closeOnNavigation: false
    //       }).afterClosed().subscribe((accepted: boolean) => {
    //         if(accepted) {  // If accepted, go into linkbattle
    //           this.router.navigate(['/', 'linkbattle']);
    //         }                       
    //         else {}                               // If rejected, continue listening

    //         this.isChallengeInConnection = false; // In either case, reset isChallengeInConnection
    //       });

    //       console.log("Got CR", mm);
    //       break;
    //     }
    //   }
    // }

    this.isChallengeInConnection = false;
    this.mqtt.listenToTopic(`challenge/${this.myUser.username}`, this.userChallengeResponseListener);
    this.userChallengeKeepAlive();
    this.checkCanEnlist();
  }
  public clearUserChallenge() {
    console.log("Clearing Challenge: ", this.challenge);
    return new Promise((resolve, reject) => {
      this.http.post('https://www.alphalink.app/api/user/deletechallenge',
                                            {username: this.myUsername, challengeid: this.challenge.id}, 
                                            {headers: {Authorization: `Bearer ${this.tokens.access_token}`}})
                  .subscribe({
                    next: (res: any) => {
                      this.challenge = undefined as unknown as IChallenge;
                      this.mqtt.disconnectListener(`challenge/${this.myUser.username}`);
                      this.checkCanEnlist();
                      console.log("Cleared Challenge",);
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("ERROR", error);
                      reject();
                    },
                  });
    });
  }
  public userChallengeKeepAlive() {
    if(this.isChallengeAutoUpdate) return;
    this.isChallengeAutoUpdate = true;

    const loopRef = setInterval(() => { // Every 10 mins, if has challenge then update ts, else cancel this loop.
      if(this.challenge == undefined || (Object.keys(this.challenge).length === 0))  {
        clearInterval(loopRef);
        return
      }

      this.updateUserChallengeTime();
    }, 600000);
  }
  private updateUserChallengeTime() {
    return new Promise((resolve, reject) => {
      this.http.post('https://www.alphalink.app/api/user/updatechallengetime', 
                                            {username: this.myUsername, challengeid: this.challenge.id}, 
                                            {headers: {Authorization: `Bearer ${this.tokens.access_token}`}})
                  .subscribe({
                    next: (res) => {
                      console.log("Updated user challenge")
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("ERROR", error);
                      reject();
                    },
                  });
    });
  }

  public hasPartner() {
    return !( (this.myUser.partner == undefined) || (Object.keys(this.myUser.partner as IPartner).length === 0));
  }
  public hasChallenge() {
    return !( (this.challenge == undefined) || (Object.keys(this.challenge as IChallenge).length === 0));
  }
  private checkCanEnlist() {
    this.canEnlist = this.hasPartner() && !this.hasChallenge();
    console.log("Checking can enlist...", this.canEnlist);
  }
}