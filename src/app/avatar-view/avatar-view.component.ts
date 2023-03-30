import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-avatar-view',
  templateUrl: './avatar-view.component.html',
  styleUrls: ['./avatar-view.component.css']
})
export class AvatarViewComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  @Input('user') username: string = this.session.myUser.username;
  @Input('dir') dir: string = 'right';
  @Input('goto') goToProfile: boolean = false;
  constructor(public session: SessionService,
              private elementRef: ElementRef,
              private router: Router,) { }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.setPixelSize();
  }

  public setPixelSize() {
    const height = this.container?.nativeElement.clientHeight;
    this.elementRef.nativeElement.style.setProperty('--pixel-size', (height/32).toString());
  }

  public clickAvatar() {
    if(this.username === this.session.myUsername) return;
    if(this.goToProfile) {
      // this.session.nav_subject.next(true);
      this.session.sidebarSubject.next(-1);
      this.router.navigate(['/'], {skipLocationChange: true}).then(() => {
        this.router.navigate(['/profile', this.username]);
      });
    }
  }
}