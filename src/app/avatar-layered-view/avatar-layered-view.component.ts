import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Wearing, wearingUtils, IWearing } from '../user-structures';

@Component({
  selector: 'app-avatar-layered-view',
  templateUrl: './avatar-layered-view.component.html',
  styleUrls: ['./avatar-layered-view.component.css']
})
export class AvatarLayeredViewComponent implements OnInit, AfterViewInit {
  @ViewChild('containerr') container!: ElementRef;
  @Input('wearing') wearing!: Wearing;
  public utils = wearingUtils;

  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if(!this.setPixelSize()) {
      setTimeout(() => {
        if(!this.setPixelSize()) {
          setTimeout(() => {
            !this.setPixelSize()
          }, 2000);
        }
      }, 2000);
    }
    console.log(this.wearing);
  }

  public setPixelSize() {
    const height = this.container.nativeElement.clientHeight;
    this.elementRef.nativeElement.style.setProperty('--pixel-size', (height/32).toString());
    return height;
  }
}
