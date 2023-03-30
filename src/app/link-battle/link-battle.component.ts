import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MqttService } from '../mqtt.service';
import { getDMOGResult, shortToLongName, vpet_name_to_commtype } from '../rom-core';
import { convertRom, convertSerialResponse } from '../rom-manager';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';

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
  public isA: boolean = true;
  public aWon: boolean = false;
  public guard: boolean = false;
  public hasEnded: boolean = false;
  public opponentAttrition: boolean = false;
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
  private readonly battleDuration: number = 24000;

  private rx_subject: Subject<string> = new Subject();
  private runChecker: boolean = false;
  private checker: number = Date.now();

  constructor(public session: SessionService,
              private mqtt: MqttService,
              private serial: SerialService,
              private router: Router) {

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

    this.bg = (Math.random() > 0.5) ? this.session.linkBattleData.original_challenge.bg : this.session.linkBattleData.response.bg;
    this.tx(JSON.stringify({type: "BG", data: this.bg}));

    this.runCheckLoop();

    if(this.myTurn) {
      setTimeout(() => {
        this.executeTurn(this.session.linkBattleData.original_challenge.rom);
      }, 15000);
    }
  }
  ngOnDestroy(): void { 
    this.session.showSideBar = true;
    this.mqtt.disconnectListener(this.topic_rx);
    this.runChecker = false;
  }
  ngOnInit(): void { }

  private tx(message: string) { this.mqtt.sendMessage(this.topic_tx, message); }

  private runCheckLoop() {
    this.runChecker = true;

    const loopRef: any = setInterval(() => {
      if(!this.runChecker) return clearInterval(loopRef);

      this.tx(JSON.stringify({type: "CHECK", data: ""}));

      if(this.checker < (Date.now() - 5000)) {
        console.log("Lost Opp...");

        this.opponentAttrition = true;
        if(!this.guard) {
          this.guard = true;
          this.battleEnd(true);
        }
      }
    }, 3000);
  }

  // Where messages arrive
  private handler = async (message: string) => {
    const m = JSON.parse(message) as IMessage;

    switch(m.type) {
      case "CHECK": { return this.checker = Date.now(); }
      case "BG": {
        this.bg = m.data;
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

        // If B, Calculate if has ended
        const r = (this.tokens.a == this.tokens.b ? -1 : (this.tokens.a > this.tokens.b ? 1 : 0) );
        
        if(r >= 0 && !this.isA) { // Has ended
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
      case "": {
        break;
      }
      case "": {
        break;
      }
      default: { break; }
    }
    return;
  }

  private async executeTurn(OPP_ROM: string) {
    this.guard = true;
    // Animate in banner
    this.animateBanner("in");

    // Serial send OPP ROM
    const rom = convertRom(convertSerialResponse(OPP_ROM), vpet_name_to_commtype["DMOG"], vpet_name_to_commtype["DMOG"]);
    console.log("Converted Rom: ", rom);
    // this.serial.sendSerial(`${rom}\n`);
    
    // Get new ROM
    const NEW_ROM = (await this.serial.getComLineFake());
    console.log("New Rom: ", NEW_ROM);

    // MQTT Send ROM
    this.tx(JSON.stringify({type: "ROM", data: NEW_ROM}));

    // Animate out banner
    this.animateBanner("out");  

    // Calculate winner
    const w = getDMOGResult(NEW_ROM); // && with isA;

    // Animate winner
    this.battle_event.next({type: "battle", data: (( (w && this.isA) || (!w && !this.isA) ) ? 'a_win' : 'b_win')})

    // Wait for animation end
    await wait(this.battleDuration);

    // Add token
    console.log("EXE TURN");
    if( ( (w && this.isA) || (!w && !this.isA) ) ) this.tokens.a += 1;
    else                  this.tokens.b += 1;

    // If A, Calculate if has ended
    const r = (this.tokens.a == this.tokens.b ? -1 : (this.tokens.a > this.tokens.b ? 1 : 0) );
    
    if(r >= 0 && this.isA) { // Has ended
      console.log("Result: ", r);
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
    this.hasEnded = true;
    this.guard = true;
    this.runChecker = false;

    this.aWon = (win && this.isA) || (!win && !this.isA)

    // Say YOUWIN/LOSE for 2s, then animate out
    this.banner_large_left_img = "YOU";
    this.banner_large_right_img = win ? "WIN" : "LOSE";
    this.animateBanner("in");
    setTimeout(() => this.animateBanner("out"), 3000);

    // Pose mons in result stances
    this.battle_event.next({type: "END", data: ( this.aWon ) ? "a_win" : "b_win"});

    // Add sugar
    await wait(3500);
    this.sugar_a =  this.aWon ? "YATTA" : this.getRandomLossSugar();
    this.sugar_b = !this.aWon ? "YATTA" : this.getRandomLossSugar();
    this.animateSugar("in");

    // Add "NEXT" button underneath
  }

  public quit() {
    this.router.navigate(['/home']);
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
}
