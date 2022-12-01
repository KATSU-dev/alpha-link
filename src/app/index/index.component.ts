import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit, AfterViewInit {
  public carousel_cursor: number = 0;
  public srcs = [ "/assets/images/splash_carousel/carousel_tricera_d.png",
                  "/assets/images/splash_carousel/carousel_hiro_d.png",                
                  "/assets/images/splash_carousel/carousel_wargrey_d.png",
                  "/assets/images/splash_carousel/carousel_rika.png",
                  "/assets/images/splash_carousel/carousel_ange.png" ];
  public opacities = ["100%", "0%", "0%", "0%", "0%"];
  public zInds = [1, 0, 0, 0, 0];
  private shifting = false;

  constructor(public session: SessionService,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setInterval(() => this.autoShiftCarousel(), 6000);
  }

  private autoShiftCarousel() {
    if(this.shifting) return;

    this.carousel_cursor += 1;
    this.carousel_cursor %= 5;
    this.shiftCarousel();
  }

  public shiftCarouselToPosition(position: number) {
    if(this.shifting || 1) return;

    this.carousel_cursor = position;
    this.carousel_cursor %= 5;
    this.shiftCarousel();
  }

  private shiftCarousel() {
    this.shifting = true;
    
    const prevCrsr = (this.carousel_cursor + 4)%5;
    const prevPrevCrsr = (this.carousel_cursor + 3)%5;

    this.opacities[prevCrsr] = "0%";
    this.opacities[this.carousel_cursor] = "100%";
    this.zInds[this.carousel_cursor] = 1;
    this.zInds[prevPrevCrsr] = 0;

    this.shifting=false;
  }

}
