import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MqttService } from '../mqtt.service';
import { getDMOGResult, shortToLongName, vpet_name_to_commtype } from '../rom-core';
import { convertRom, convertSerialResponse } from '../rom-manager';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';
import { MatDialog } from '@angular/material/dialog';
import { LinkBattleConcludeComponent } from '../link-battle-conclude/link-battle-conclude.component';
import { HttpClient } from '@angular/common/http';
import { NUMERALS } from '../combat-structures';

interface IMessage {
  type: string,
  data: string
}

const wait = (ms: number) => { return new Promise((resolve, reject) => setTimeout(() => resolve(true), ms)) }

@Component({
  selector: 'app-link-battle',
  templateUrl: './link-battle.component.html',
  styleUrls: ['./link-battle.component.css']
})
export class LinkBattleComponent implements OnInit, OnDestroy {
  public user_a: string = "";
  public user_b: string = "";
  public mon_a: string = "";
  public mon_a_long: string = "";
  public mon_b: string = "";
  public mon_b_long: string = "";
  private topic_rx: string = "";
  private topic_tx: string = "";
  public bg: string = "backdrop_grassy_plains.png";
  public loss_sugar: string = "";
  public isA: boolean = true;
  private aWon: boolean = false;
  private guard: boolean = false;
  private hasEnded: boolean = false;
  private battleEnded: boolean = false;
  public showNext: boolean = false;
  private opponentAttrition: boolean = false;
  private opponentResolved: boolean = false;   // 0 = Opponent left, no resolution; 1 = Opponent left, with resolution
  public battle_event: Subject<IMessage> = new Subject();
  
  public fadeBanner: boolean = false;
  public showBanner: boolean = true;
  public banner_large_left_img = "ROUND";
  public banner_large_right_img = "";

  public fadeSugar: boolean = false;
  public showSugar: boolean = false;
  public sugar_a: string = "";
  public sugar_b: string = "";

  public round_num: number = 1;
  public myTurn: boolean = false;
  public tokens = {a: 0, b: 0};
  private readonly battleDuration: number = 24000 + 62.5;

  private runChecker: boolean = false;
  private checker: number = Date.now()+1500;

  private clickedQuit: boolean = false;
  private clickedNext: boolean = false;
  private myAttrition: boolean = false;

  private ranks: Array<number> = [0, 0];
  private rewardsTable: Array<{field: string, value: number, reward: number, result: number}> = [];

  constructor(public session: SessionService,
              private http: HttpClient,
              private mqtt: MqttService,
              private serial: SerialService,
              private router: Router,
              public dialog: MatDialog) {

    if(!this.session.tokens.tokensPresent()){
      this.router.navigate(['/']);
      return;
    }

    this.session.showSideBar = false;
    this.session.showTopBar = true;
    this.session.showTopBarSearch = false;

    this.user_a = this.session.linkBattleData.original_challenge.challenger;
    this.user_b = this.session.linkBattleData.response.challenger;

    this.mon_a = this.session.linkBattleData.original_challenge.mon;
    this.mon_a_long = shortToLongName(this.mon_a);
    this.mon_b = this.session.linkBattleData.response.mon;
    this.mon_b_long = shortToLongName(this.mon_b);

    this.guard = false;
    this.hasEnded = false;
    this.opponentAttrition = false;
    this.banner_large_left_img = "ROUND";
    this.banner_large_right_img = "";

    this.aWon = false;
    this.isA = this.session.myUser.username === this.user_a;
    this.myTurn = (this.isA !== (((this.round_num-1)%2) == 0));
    console.log("Is my turn:", this.myTurn);

    this.topic_rx = this.user_a === this.session.myUser.username ? `challenge/${this.user_b}/${this.user_a}` : `challenge/${this.user_a}/${this.user_b}`;
    this.topic_tx = this.user_a === this.session.myUser.username ? `challenge/${this.user_a}/${this.user_b}` : `challenge/${this.user_b}/${this.user_a}`;

    // this.mqtt.listenToTopic(this.topic_rx, (data:string) => this.rx_subject.next(data));
    this.mqtt.listenToTopic(this.topic_rx, this.handler);

    this.getRanks();

    if(this.isA) {
      this.bg = (Math.random() > 0.5) ? this.session.linkBattleData.original_challenge.bg : this.session.linkBattleData.response.bg;
      this.loss_sugar = this.getRandomLossSugar();
      this.tx(JSON.stringify({type: "BG", data: this.bg}));
  
      // Try again twice to be sure
      setTimeout(() => {
        this.tx(JSON.stringify({type: "BG", data: this.bg}));
        this.tx(JSON.stringify({type: "SUGAR", data: this.loss_sugar}));
      }, 1000);

      // Try again thrice to be sure
      setTimeout(() => {
        this.tx(JSON.stringify({type: "BG", data: this.bg}));
        this.tx(JSON.stringify({type: "SUGAR", data: this.loss_sugar}));
      }, 2000);

      // Try again qrice to be sure
      setTimeout(() => {
        this.tx(JSON.stringify({type: "BG", data: this.bg}));
        this.tx(JSON.stringify({type: "SUGAR", data: this.loss_sugar}));
      }, 3000);
    }

    this.runCheckLoop();

    if(this.myTurn) {
      setTimeout(() => {
        this.executeTurn(this.session.linkBattleData.original_challenge.rom);
      }, 15000);
    }    
  }
  ngOnDestroy(): void { 
    this.session.showSideBar = true;
    this.session.showTopBar = true;
    // this.session.checkCanEnlist();
    this.mqtt.disconnectListener(this.topic_rx);
    this.runChecker = false;
    this.hasEnded = true;
    this.serial.closePort();
  }
  ngOnInit(): void { }

  private tx(message: string) { this.mqtt.sendMessage(this.topic_tx, message); }

  private runCheckLoop() {
    this.runChecker = true;

    const loopRef: any = setInterval(() => {
      if(!this.runChecker || this.hasEnded) return clearInterval(loopRef);

      this.tx(JSON.stringify({type: "CHECK", data: ""}));

      if(this.checker < (Date.now() - 3000)) {
        console.log("Lost Opp...");

        this.opponentAttrition = true;
        
        if(!this.guard) {
          this.guard = true;
          this.battleEnd(true);
        }
      }
    }, 1000);
  }

  // Where messages arrive
  private handler = async (message: string) => {
    const m = JSON.parse(message) as IMessage;

    switch(m.type) {
      case "CHECK": { return this.checker = Date.now(); }
      case "BG": {
        this.bg = m.data;
        console.log("STORING BG", this.bg);
        break;
      }
      case "SUGAR": {
        this.loss_sugar = m.data;
        console.log("STORING SUGAR", this.loss_sugar);
        break;
      }
      case "ROM": {
        // Guard Clause
        if(this.guard) break;
        this.guard = true;
        
        // Clear serial

        // Animate out banner
        this.animateBanner("out");

        // Calculate winner
        const w = !getDMOGResult(m.data); // && with isA;

        // Animate winner
        this.battle_event.next({type: "battle", data: (( (w && this.isA) || (!w && !this.isA) ) ? 'a_win' : 'b_win')})
        await wait(this.battleDuration);

        // Check for attrition
        if(this.opponentAttrition) {
          this.battleEnd(true);
          break;
        }

        // Add token
        if( ( (w && this.isA) || (!w && !this.isA) ) ) this.tokens.a += 1;
        else                  this.tokens.b += 1;

        // Calculate if has ended
        const r = (this.tokens.a == this.tokens.b ? -1 : (this.tokens.a > this.tokens.b ? 1 : 0) );
        
        // If is userB and not a draw, OR is userA and round 9
        if((r >= 0 && !this.isA) || (this.round_num == 9 && this.isA)) { // Has ended
          console.log("Result: ", r);
          this.battleEnd( r&&this.isA || !r&&!this.isA );
        }
        else {
          // Execute own turn
          this.round_num += 1;
          this.myTurn = (this.isA !== (((this.round_num-1)%2) == 0));
          if(this.myTurn) this.executeTurn(m.data);
        }

        this.guard = false;
        break;
      }
      case "RESOLVED": {
        this.opponentResolved = true;
        break;
      }
      default: { break; }
    }
    return;
  }

  private async executeTurn(OPP_ROM: string) {
    this.guard = true;
    // Animate in banner
    if(!this.showBanner) this.animateBanner("in");

    // Serial send OPP ROM
    // console.log("OPPROM", OPP_ROM);
    // console.log("ConvSerRom", convertSerialResponse(OPP_ROM));
    const rom = convertRom(convertSerialResponse(OPP_ROM), vpet_name_to_commtype["DMOG"], vpet_name_to_commtype["DMOG"]);
    // console.log("ConvRomFul", rom);

    // Get new ROM
    this.serial.sendSerial(`${rom}\n`);
    // const NEW_ROM = (await this.serial.getComLineFake());
    const NEW_ROM = (await this.serial.getComLine());
    this.serial.clearComLine();
    // console.log("New Rom: ", NEW_ROM);

    // Check if quit
    if(this.hasEnded) return;

    // MQTT Send ROM
    this.tx(JSON.stringify({type: "ROM", data: NEW_ROM}));

    // Animate out banner
    this.animateBanner("out");  

    // Calculate winner
    const w = getDMOGResult(NEW_ROM);

    // Animate winner
    this.battle_event.next({type: "battle", data: (( (w && this.isA) || (!w && !this.isA) ) ? 'a_win' : 'b_win')})

    // Wait for animation end
    await wait(this.battleDuration);

    // Check for attrition
    if(this.opponentAttrition) {
      if(this.isA)  this.tokens.a += 1;
      else          this.tokens.b += 1;

      this.battleEnd(true);
      return;
    }

    // Add token
    if( ( (w && this.isA) || (!w && !this.isA) ) )  this.tokens.a += 1;
    else                                            this.tokens.b += 1;

    // If A, Calculate if has ended
    const r = (this.tokens.a == this.tokens.b ? -1 : (this.tokens.a > this.tokens.b ? 1 : 0) );
    
    // If is userA and not a draw, OR is userB and round 9
    if( (r >= 0 && this.isA) || (this.round_num == 9 && !this.isA)) { // Has ended
      this.battleEnd( r&&this.isA || !r&&!this.isA );
    }
    else {
      // Animate in banner and wait
      this.round_num += 1;
      this.myTurn = (this.isA !== (((this.round_num-1)%2) == 0));
      this.animateBanner("in");
    
      this.guard = false;
    }
  }

  private async battleEnd(win: boolean) {
    if(this.battleEnded) return;

    this.resolveStats(win);

    if(this.showBanner) {
      this.fadeBanner = true;
      await wait(310);
      this.showBanner = false;
      this.fadeBanner = false;
    }

    this.hasEnded = true;
    this.battleEnded = true;
    this.guard = true;
    this.runChecker = false;

    this.aWon = (win && this.isA) || (!win && !this.isA);

    // Say YOUWIN/LOSE for 2s, then animate out
    this.banner_large_left_img = "YOU";
    this.banner_large_right_img = win ? "WIN" : "LOSE";
    setTimeout(() => {
      this.animateBanner("in");
      setTimeout(() => this.animateBanner("out"), 3000);
    }, 1000);

    // Pose mons in result stances
    setTimeout(() => this.battle_event.next({type: "END", data: ( this.aWon ) ? "a_win" : "b_win"}), 50);
    

    // Add sugar
    setTimeout(() => {
      this.sugar_a =  this.aWon ? "YATTA" : this.loss_sugar;
      this.sugar_b = !this.aWon ? "YATTA" : this.loss_sugar;
      this.animateSugar("in");  
    }, 3000);
    
    // Add "NEXT" button underneath
    setTimeout(() => this.showNext = true, 5000);
  }

  public async quit() {
    if(this.hasEnded || this.clickedQuit) return;
    this.hasEnded = true;
    this.clickedQuit = true;
    this.myAttrition = true;

    this.battleEnd(false)
      .then(() => {
        this.tx(JSON.stringify({type: "RESOLVED", message: ""}));
        this.mqtt.disconnectListener(this.topic_rx);
      });
    
    await wait(4000);

    this.dialog.open(LinkBattleConcludeComponent, {
      width: '572px',
      minHeight: '80px',
      panelClass: 'custom-container',
      disableClose: true,
      data: {
              tableData: this.rewardsTable, 
              opponentResolved: true, 
              canShare: false,
              tokens_a: 0,
              tokens_b: 0,
              sugar_loss: ""
            },
    }).afterClosed().subscribe(() => {
      this.router.navigate(['/', 'opponentsearch']);
    });
  }
  public async next() {
    if(!this.hasEnded || this.clickedNext) return;
    this.hasEnded = true;
    this.clickedNext = true;

    await wait(500);

    this.dialog.open(LinkBattleConcludeComponent, {
      width: '572px',
      minHeight: '80px',
      panelClass: 'custom-container',
      disableClose: true,
      data: {
              tableData: this.rewardsTable, 
              opponentResolved: (!this.opponentAttrition || (this.opponentAttrition && this.opponentResolved) ), 
              canShare: !this.opponentAttrition,
              tokens_a: this.tokens.a,
              tokens_b: this.tokens.b,
              sugar_loss: this.loss_sugar,
              bg: this.bg
            },
    }).afterClosed().subscribe(() => {
      this.router.navigate(['/', 'opponentsearch']);
    });
  }

  private animateBanner(dir: string) {
    if(dir === "out") {
      this.fadeBanner = true;
      setTimeout(() => {
        this.showBanner = false;
        this.fadeBanner = false;
      }, 310);
    }
    else if(dir === "in") {
      this.fadeBanner = false;
      this.showBanner = true;
    }
  }
  private animateSugar(dir: string) {
    if(dir === "out") {
      this.fadeSugar = true;
      setTimeout(() => {
        this.showSugar = false;
        this.fadeSugar = false;
      }, 310);
    }
    else if(dir === "in") {
      this.fadeSugar = true;
      this.showSugar = true;
      setTimeout(() => {
        this.fadeSugar = false;
      }, 500);
    }
  }
  private getRandomLossSugar(): string {
    const t = Math.floor(Math.random()*4);

    switch(t) {
      case 0: return "MEAT";
      case 1: return "POOP";
      case 2: return "TENSE";
      case 3:
      default: return "SWEAT";
    }

    // switch(t) {
    //   case 0: return "MEAT";
    //   case 1: 
    //   default:return "POOP";
    // }
  }
  
  private getRanks() {
    // Get ranks at start of battle so they can be passed on at end
    return new Promise((resolve, reject) => {
      this.http.post<{userA: number|string, userB: number|string}>('https://www.alphalink.app/api/user/getuserranks', 
                                            {usera: this.session.linkBattleData.original_challenge.challenger, userb: this.session.linkBattleData.response.challenger}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (ranks: {userA: number|string, userB: number|string}) => {
            this.ranks = [ranks.userA as number, ranks.userB as number];
            console.log("Got Ranks", ranks);
            resolve("OK");
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });
    });
  }


  private async resolveStats(won: boolean) {
    console.log("Resolving Stats", this.ranks);
    const currencyRaise = this.calcCurrency(won, this.session.linkBattleData.original_challenge.stage, this.session.linkBattleData.response.stage);
  
    const d = this.isA ? this.ranks[1] - this.ranks[0] : this.ranks[0] - this.ranks[1];
    const eloRaise = this.calcEloRaise(d, won);

    this.rewardsTable = [
      {
        field:  "Rank",
        value:  this.session.myUser.rank as number,
        reward: eloRaise as number,
        result: this.session.myUser.rank+eloRaise as number
      },
      {
        field:  "Currency",
        value:  this.session.myUser.currency as number,
        reward: currencyRaise as number,
        result: this.session.myUser.currency+currencyRaise as number
      }
    ]

    await this.updateUser(this.rewardsTable[0].result, this.rewardsTable[1].result, won);
  }
  private updateUser(rank: number, currency: number, won: boolean) {
    let chk = 0;
    console.log("UPDATE USER");

    return new Promise((resolve, reject) => {
      this.http.post<{status: string, failed?: string}>('https://www.alphalink.app/api/user/updateuserbattles', 
                                      {username: this.session.myUsername, result: won ? "wins" : "loss"}, 
                                      {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (res: {status: string, failed?: string}) => {
            if(won) this.session.myUser.wins += 1;
            else    this.session.myUser.loss -= 1;
            chk += 1;
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });


      this.http.post<{status: string, failed?: string}>('https://www.alphalink.app/api/user/updateuserfields', 
                                      {username: this.session.myUsername, rank: rank, currency: currency}, 
                                      {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (res: {status: string, failed?: string}) => {
            this.session.myUser.rank = rank;
            this.session.myUser.currency = currency;
            chk += 1;
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });

      const loopRef = setInterval(() => {
        if(chk == 2) {
          clearInterval(loopRef);
          resolve("OK");
        }
      }, 500);
    });
  }
  private calcEloRaise(diff: number, won: boolean):number {
    if(this.myAttrition) return 0;
    const a_m = (!this.opponentAttrition || (this.opponentAttrition && this.opponentResolved)) ? 1 : 0.7;
    console.log(a_m);

    diff = diff < 1 ? 1 : diff;
    let m = 250/diff;
        m = m>1 ? 2 : 3*m;

    return won? 1+Math.floor(a_m*((Math.log(diff) / Math.log(20)) * 2*(4 + m))) : 1;
  }
  private calcCurrency(won: boolean, stage_a: string, stage_b: string):number {
    if(this.myAttrition) return 0;
    const a_m = (!this.opponentAttrition || (this.opponentAttrition && this.opponentResolved)) ? 1 : 0.7;

    const s_a = NUMERALS.indexOf(stage_a);
    const s_b = NUMERALS.indexOf(stage_b);
    if(s_a < 1 || s_b < 1) { console.log("Error calculating currency", won, stage_a, stage_b); return 0; }

    return Math.round(a_m* ((won ? 60 : 8) + ( Math.min(s_a, s_b) * 5 ) * (1 - Math.random()*0.4)) );
  }
}
