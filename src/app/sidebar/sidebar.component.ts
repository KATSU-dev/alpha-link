import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  public selected: number = 0;

  constructor(private router: Router,
              private session: SessionService) { }

  ngOnInit(): void {
  }

  public selectIcon(icon: string) {
    switch(icon) {
      case "profile":
        this.router.navigate(['/profile', this.session.myUsername]);
        this.selected = 0;
        break;
      case "feed":
        this.router.navigate(['/feed']);
        this.selected = 1;
        break;
      case "connect":
        this.router.navigate(['/connect']);
        this.selected = 2;
        break;
      case "athenaeum":
        this.router.navigate(['/athenaeum']);
        this.selected = 3;
        break;
      case "leaderboard":
        this.router.navigate(['/leaderboard']);
        this.selected = 4;
        break;
      case "shop":
        this.router.navigate(['/shop']);
        this.selected = 5;
        break;
      case "settings":
        this.router.navigate(['/settings']);
        this.selected = 6;
        break;
    }
  }

}
