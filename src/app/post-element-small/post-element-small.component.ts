import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Post } from '../misc-backend-structures';
import { PostElementFullComponent } from '../post-element-full/post-element-full.component';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-post-element-small',
  templateUrl: './post-element-small.component.html',
  styleUrls: ['./post-element-small.component.css']
})
export class PostElementSmallComponent implements OnInit {
  @Input('post') public post!: Post;
  constructor(public http: HttpClient,
              public session: SessionService,
              public dialog: MatDialog,
              private router: Router) { }

  ngOnInit(): void {
  }

  public clickLike() {
    const endpoint = this.post.liked ? 'unlikepost' : 'likepost';
    return new Promise((resolve, reject) => {
      this.http.post<Array<Post>>(`https://www.alphalink.app/api/user/${endpoint}`, 
                                            {username: this.session.myUsername, id: this.post.id},
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (res: any) => {
                      console.log(res);
                      this.post.likes += this.post.liked ? -1 : 1;
                      this.post.liked = this.post.liked ? 0 : 1;
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("ERROR", error);
                      reject();
                    },
                  });
    });
  }

  public openFull() {
    this.dialog.open(PostElementFullComponent, {
      width: '780px',
      minHeight: '480px',
      maxHeight: '90vh',
      panelClass: 'custom-container',
      closeOnNavigation: true,
      data: {
        post: this.post
      }
    });
  }

  public navToProfile() {
    if(this.post.username === this.session.myUsername) return;
    this.router.navigate(['/', 'profile', this.post.username]);
    this.session.sidebarSubject.next(-1);
  }
}
