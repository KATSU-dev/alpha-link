import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // public selected: number = 0;

  constructor(private router: Router,
              public session: SessionService) { }

  ngOnInit(): void {
    this.session.sidebarSubject.subscribe(num => {
      this.session.sidebarSelected = num;
    });
  }

  public selectIcon(icon: string) {
    switch(icon) {
      case "home":
        this.router.navigate(['/home']);
        this.session.sidebarSelected = 0;
        break;
      case "profile":
        this.router.navigate(['/'], {skipLocationChange: true}).then(() => {
          this.router.navigate(['/profile', this.session.myUsername]);
        });
        this.session.sidebarSelected = 1;
        break;
      case "oppsrch":
        this.router.navigate(['/opponentsearch']);
        this.session.sidebarSelected = 2;
        break;
      case "athenaeum":
        this.router.navigate(['/athenaeum']);
        this.session.sidebarSelected = 3;
        break;
      case "leaderboard":
        this.router.navigate(['/leaderboard']);
        this.session.sidebarSelected = 4;
        break;
      case "shop":
        this.router.navigate(['/shop']);
        this.session.sidebarSelected = 5;
        break;
      case "settings":
        this.router.navigate(['/settings']);
        this.session.sidebarSelected = 6;
        break;
      case "test":
        this.setupFakeLinkbattle();
        this.router.navigate(['/linkbattle']);
        this.session.sidebarSelected = 7;
        break;
    }
  }

  private setupFakeLinkbattle() {
    this.session.linkBattleData.original_challenge = {
      challenger: "Taken",
      title: "Newbie",
      target: "",
      global: true,
      accepted: false,
      type: "DM20",
      bg: "backdrop_grassy_plains.png",
      mon: "rose_x",
      stage: "IV",
      rom: "s:FC03 r:FC03 s:FD02 r:FD02"
    }
    this.session.linkBattleData.response = {
      challenger: "Katsu",
      title: "Newbie",
      target: "",
      global: true,
      accepted: false,
      type: "DM20",
      bg: "backdrop_grassy_plains.png",
      mon: "ladydevi_x",
      stage: "IV",
      rom: "s:FC03 r:FC03 s:FD02 r:FD02"
    }
  }

}
