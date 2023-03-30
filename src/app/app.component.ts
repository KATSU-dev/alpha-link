import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { SessionService } from './session.service';
import gsap from 'gsap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'Alpha Link';
  @ViewChild('bgwave') svgElRef!: ElementRef;

  constructor(public session: SessionService) {
  }

  ngAfterViewInit(): void {
    this.bgg();
  }

  private bgg() {
    const svgEl = this.svgElRef.nativeElement;
    const path1 = svgEl.querySelector('#path1');
    const path2 = svgEl.querySelector('#path2');

    gsap.timeline().to(path1, {
      duration: 2000,
      attr: {
        morph: [path1.getAttribute('d'), path2.getAttribute('d')],
      },
    });
    console.log("EEE");
  }

}
