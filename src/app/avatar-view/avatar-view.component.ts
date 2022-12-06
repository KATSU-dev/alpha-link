import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-avatar-view',
  templateUrl: './avatar-view.component.html',
  styleUrls: ['./avatar-view.component.css']
})
export class AvatarViewComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  @Input('user') username: string = this.session.myUsername;
  @Input('dir') dir: string = 'right';
  constructor(public session: SessionService,
              private elementRef: ElementRef) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setPixelSize();
  }

  public setPixelSize() {
    const height = this.container?.nativeElement.clientHeight;
    this.elementRef.nativeElement.style.setProperty('--pixel-size', (height/32).toString());
  }
}