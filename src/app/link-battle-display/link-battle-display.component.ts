import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { ScannedDigimon, getScannedMonFromIndex, vpet } from '../rom-core';
import { SessionService } from '../session.service';

interface IBattleEvent {
  type: string,
  data: string,
}

@Component({
  selector: 'app-link-battle-display',
  templateUrl: './link-battle-display.component.html',
  styleUrls: ['./link-battle-display.component.css']
})
export class LinkBattleDisplayComponent implements OnInit, AfterViewInit {
  // @ViewChild('overlay') public overlay_div!: ElementRef;
  @ViewChild('mon_left_div') public mon_left_div!: ElementRef;
  @ViewChild('user_left_div') public user_left_div!: ElementRef;
  @ViewChild('mon_right_div') public mon_right_div!: ElementRef;
  @ViewChild('user_right_div') public user_right_div!: ElementRef;
  @ViewChild('shot_div') public shot_div!: ElementRef;
  @Input('battle_event') public  battle_event!: Subject<IBattleEvent>;
  @Input('user_a') public user_a!: string;
  @Input('mon_a') public  mon_a!: string;
  @Input('user_b') public user_b!: string;
  @Input('mon_b') public  mon_b!: string;
  public overlay_caption: string = "Enter the BATTLE mode on your VPet."
  public result!: string;

  constructor(public session: SessionService,
              private snackBar: MatSnackBar,
              private elementRef: ElementRef) {
      
  }

  ngOnInit(): void {
    this.battle_event.subscribe((e: IBattleEvent) => {
      if(e.type === "update") {
        // this.overlay_caption = data.update as string;
        // this.overlay_div.nativeElement.classList.remove('overlay-load-in');
        // this.overlay_div.nativeElement.classList.remove('overlay-load-out');
        // this.overlay_div.nativeElement.classList.add('overlay-load-in');

        // this.overlay_div.nativeElement.addEventListener('animationend', () => {
        //   this.overlay_div.nativeElement.classList.remove('overlay-load-in');
        //   this.overlay_div.nativeElement.classList.add('overlay-load-out');
        // });
        this.snackBar.open(e.data);
      }
      if(e.type === 'battle') {
        // Remove old classes
        this.user_left_div.nativeElement.classList.remove("slow-4s");
        this.mon_left_div.nativeElement.classList.remove("slow-4s");
        this.user_right_div.nativeElement.classList.remove("slow-4s");
        this.mon_right_div.nativeElement.classList.remove("slow-4s");
        this.mon_left_div.nativeElement.classList.remove('mon-idle');
        this.mon_right_div.nativeElement.classList.remove('mon-idle');

        switch(e.data) {
          case "a_win": {
            this.mon_left_div.nativeElement.classList.add("mon-battle-start-and-win");
            this.mon_right_div.nativeElement.classList.add("mon-battle-sec-and-lose");
            break;
          }
          case "b_win": {
            this.mon_left_div.nativeElement.classList.add("mon-battle-start-and-lose");
            this.mon_right_div.nativeElement.classList.add("mon-battle-sec-and-win");
            break;
          }
          default: break;
        }
      }
      if(e.type === 'END') {
        // Remove old classes
        this.user_left_div.nativeElement.classList.remove("slow-4s");
        this.mon_left_div.nativeElement.classList.remove("slow-4s");
        this.user_right_div.nativeElement.classList.remove("slow-4s");
        this.mon_right_div.nativeElement.classList.remove("slow-4s");
        this.mon_left_div.nativeElement.classList.remove('mon-idle');
        this.mon_right_div.nativeElement.classList.remove('mon-idle');
        this.mon_left_div.nativeElement.classList.remove("mon-battle-start-and-win");
        this.mon_right_div.nativeElement.classList.remove("mon-battle-sec-and-lose");
        this.mon_left_div.nativeElement.classList.remove("mon-battle-start-and-lose");
        this.mon_right_div.nativeElement.classList.remove("mon-battle-sec-and-win");

        switch(e.data) {
          case "a_win": {
            this.mon_left_div.nativeElement.classList.  add("mon-won");
            this.mon_right_div.nativeElement.classList. add("mon-lost");
            break;
          }
          case "b_win": {
            this.mon_left_div.nativeElement.classList.  add("mon-lost");
            this.mon_right_div.nativeElement.classList. add("mon-won");
            break;
          }
          default: break;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.setMonPixelSize();
      this.setUserPixelSize();  
    }, 2000);
    

    this.user_left_div.nativeElement.addEventListener('animationend', (event: any) => {
      switch(event.animationName) {
        case "user-left-slide-in":
          event.target.classList.add('in-place');
          event.target.classList.remove('slow-4s');
          event.target.classList.remove('user-left-walk-in');
          break;
        default: break;
      }
    });

    this.mon_left_div.nativeElement.addEventListener('animationend', (event: any) => {
      switch(event.animationName) {
        case "mon-left-slide-in":
          event.target.classList.add('in-place');
          event.target.classList.remove('slow-4s');
          event.target.classList.remove('mon-left-walk-in');
          event.target.classList.add('mon-start-dance');
          break;
        case "win-battle-dance":
        case "lose-battle-dance":
          this.mon_left_div.nativeElement.classList.remove("mon-battle-start-and-win");
          this.mon_left_div.nativeElement.classList.remove("mon-battle-start-and-lose");
          this.mon_left_div.nativeElement.classList.remove("mon-battle-sec-and-win");
          this.mon_left_div.nativeElement.classList.remove("mon-battle-sec-and-lose");
          this.mon_left_div.nativeElement.classList.add('mon-idle');
          break;
        case "entrance-dance": 
          this.mon_left_div.nativeElement.classList.remove('mon-start-dance');
          this.mon_left_div.nativeElement.classList.add('mon-idle');
          break;
        default: break;
      }
    }, false);

    this.mon_left_div.nativeElement.addEventListener('animationstart', (event: any) => {
      switch(event.animationName) {
        case "shoot-and-wait":
          setTimeout(() => {
            this.shot_div.nativeElement.classList.add("shot-move-left-to-right");
            this.shot_div.nativeElement.classList.remove("hide");
          }, 100);
          break;
        default: break;
      }
    }, false);

    this.user_right_div.nativeElement.addEventListener('animationend', (event: any) => {
      switch(event.animationName) {
        case "user-right-slide-in":
          event.target.classList.add('in-place');
          event.target.classList.remove('slow-4s');
          event.target.classList.remove('user-right-walk-in');
          break;
        default: break;
      }
    });

    this.mon_right_div.nativeElement.addEventListener('animationend', (event: any) => {
      switch(event.animationName) {
        case "mon-right-slide-in":
          event.target.classList.add('in-place');
          event.target.classList.remove('slow-4s');
          event.target.classList.remove('mon-right-walk-in');
          event.target.classList.add('mon-start-dance');
          break;
        case "win-battle-dance":
        case "lose-battle-dance":
          this.mon_right_div.nativeElement.classList.remove("mon-battle-start-and-win");
          this.mon_right_div.nativeElement.classList.remove("mon-battle-start-and-lose");
          this.mon_right_div.nativeElement.classList.remove("mon-battle-sec-and-win");
          this.mon_right_div.nativeElement.classList.remove("mon-battle-sec-and-lose");
          this.mon_right_div.nativeElement.classList.add('mon-idle');
          break;
        case "entrance-dance": 
          this.mon_right_div.nativeElement.classList.remove('mon-start-dance');
          this.mon_right_div.nativeElement.classList.add('mon-idle');
          break;
        default: break;
      }
    }, false);

    this.mon_right_div.nativeElement.addEventListener('animationstart', (event: any) => {
      switch(event.animationName) {
          case "shoot-and-wait":
            setTimeout(() => {
              this.shot_div.nativeElement.classList.add("shot-move-right-to-left");
              this.shot_div.nativeElement.classList.remove("hide");
            }, 100);
            break;
        default: break;
      }
    }, false);

    this.shot_div.nativeElement.addEventListener('animationend', (event: any) => {
      switch(event.animationName) {
        case "shot-slide-left-to-right":
        case "shot-slide-right-to-left": {
          this.shot_div.nativeElement.classList.add("hide");
          this.shot_div.nativeElement.classList.remove("shot-move-left-to-right");
          this.shot_div.nativeElement.classList.remove("shot-move-right-to-left");
          break;
        }
        default: break;
      }
    });
  }

  private animateShotDiv() {
    let counter = 0
    let sd_f = true;

    setTimeout(() =>{
      this.shot_div.nativeElement.classList.remove("hide");
      this.shot_div.nativeElement.classList.add("shot-move-left-to-right");
    }, 4050);
    
    this.shot_div.nativeElement.addEventListener('animationend', (event: any) => {
      if(event.animationName === "shot-sprite-shift") return;
      this.shot_div.nativeElement.classList.add("hide");
      this.shot_div.nativeElement.classList.remove(sd_f ? 'shot-move-left-to-right' : 'shot-move-right-to-left');
      if(counter++ < 3){
        setTimeout(() => {
          this.shot_div.nativeElement.classList.remove("hide");
          this.shot_div.nativeElement.classList.add(sd_f ? 'shot-move-right-to-left' : 'shot-move-left-to-right');
          sd_f = !sd_f;
        }, 2010);
      } else {
        this.shot_div.nativeElement.classList.add("hide");
      }
    });
  }

  private setUserPixelSize() {
    const height = this.user_right_div?.nativeElement.clientHeight;
    const width = this.user_right_div?.nativeElement.clientWidth;
    console.log("User Pixel Size Width", height, width);
    this.elementRef.nativeElement.style.setProperty('--user-pixel-size', (height/32).toString());  
  }

  private setMonPixelSize() {
    const width = this.mon_left_div?.nativeElement.clientWidth;
    console.log("Mon Pixel Size Width", width);
    this.elementRef.nativeElement.style.setProperty('--mon-pixel-size', (width/16).toString());
  }
}
