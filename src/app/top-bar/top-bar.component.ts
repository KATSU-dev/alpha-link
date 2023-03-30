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

  constructor(public session: SessionService) { }

  ngOnInit(): void { }

  public go() { this.session.topBarSubject.next({event: "ENTER"}) }

  public press(event: KeyboardEvent) {
    if(event.key == "Enter") return;

    const inputElement = event.target as HTMLInputElement;
    this.session.topBarSubject.next({event: "KEYPRESS", data: inputElement.value});
  }
}
