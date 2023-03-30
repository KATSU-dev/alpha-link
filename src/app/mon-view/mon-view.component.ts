import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// const delays = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25];
// const cum_delays = [0, 100, 195, 285, 370, 450, 525, 595, 660, 720, 775, 825, 870, 910, 945, 975, 1000];

const delays = [70, 66, 63, 60, 56, 52, 49, 45, 42, 39, 35, 32, 28, 24, 21, 18]
const cum_delays = [0, 70, 136, 199, 259, 315, 367, 416, 461, 503, 542, 577, 609, 637, 661, 682]

// const cum_delays = [25, 55, 90, 130, 175, 225, 280, 340, 405, 475, 550, 630, 715, 805, 900, 1000]

@Component({
  selector: 'app-mon-view',
  templateUrl: './mon-view.component.html',
  styleUrls: ['./mon-view.component.css']
})
export class MonViewComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('mon') mon_img!: ElementRef;
  @ViewChild('pixel') mon_pixel!: ElementRef;
  @Input('monName') public monName!: string;
  @Input('anim_event') anim_event!: Subject<{anim: Array<string>}>;
  @Input('state') public state: string = "pixel";

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    setTimeout(() => {
      if(this.state === "pixel") this.pixelateLoad();
    }, 1500);
  }

  private pixelateLoad() {
    {
      this.state = "pixel";
      const img = new Image();
      img.src = ('/assets/images/sprites/'+this.monName+'.png');

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const pixels = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const a = imageData.data[i + 3];
          pixels.push([r, g, b, a]);
        }

        const pixelContainer = document.getElementById('pixel-container') as HTMLElement;
        for (let i = 0; i < 16; i++) {          // ROW
          const row = document.createElement('div');
          row.classList.add('row');
          pixelContainer.appendChild(row);
          for (let j = 0; j < 16; j++) {        // COLUMNS (Pixel)
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            
            pixel.style.backgroundColor = `rgba(${pixels[i*64+j][0]}, ${pixels[i*64+j][1]}, ${pixels[i*64+j][2]}, ${pixels[i*64+j][3]})`;

            pixel.style.zIndex = `${(256 - (j + (i*16)))+25}`;
            
            // const tt = 100;
            // const delay = (16*tt)- ((i*tt)-(Math.random() * tt));

            const delay = (cum_delays[15-i]) + (Math.random() * delays[15-i]);

            pixel.style.animationDelay = `${delay}ms`;
            row.appendChild(pixel);
          }
        }

        setTimeout(() => {
          this.state = "normal";
          this.anim_event.next({anim: ["celebrate"]});
        }, 1000);

      }
    }
  }
  private pixelateClear() {
    console.log("STATE 1:", this.state);
    this.state = "pixel";
    setTimeout(() => {
      (document.getElementById('pixel-container') as HTMLElement).innerHTML = '';
      // this.mon_pixel.nativeElement.innerHTML = '';
      console.log("STATE 2:", this.state);
    }, 25);
  }

  ngAfterViewInit(): void {
    this.setPixelSize();
    if(this.anim_event == null) return;
    this.anim_event.subscribe((data: {anim: Array<string>}) => {
      if(data.anim[0].includes("pixelate-load")) 
        return this.pixelateLoad();

      if(data.anim[0].includes("pixelate-clear"))
        return this.pixelateClear();

      data.anim.forEach(name => {
        this.mon_img.nativeElement.classList.add(name);
      });
      this.mon_img.nativeElement.addEventListener('animationend', () => {
        data.anim.forEach(name => {
          this.mon_img.nativeElement.classList.remove(name);
        });
      }, false);
    });
  }

  public setPixelSize() {
    const width = this.container?.nativeElement.clientWidth;
    this.elementRef.nativeElement.style.setProperty('--pixel-size', (width/16).toString());
  }
}
