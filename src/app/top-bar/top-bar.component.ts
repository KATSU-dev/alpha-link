import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreatePostComponent } from '../create-post/create-post.component';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  public searchTerm: string = "";

  constructor(public session: SessionService,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  public searchUser() {
    this.router.navigate(['/profile', this.searchTerm]);
  }

  public createPost() {
    this.dialog.open(CreatePostComponent, {
      width: '450px',
      minHeight: '180px',
      panelClass: 'custom-container'
    });
  }
}
