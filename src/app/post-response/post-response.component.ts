import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../misc-backend-structures';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-post-response',
  templateUrl: './post-response.component.html',
  styleUrls: ['./post-response.component.css']
})
export class PostResponseComponent implements OnInit {
  @Input('post') post!: Post;

  constructor(public http: HttpClient,
              public session: SessionService,) { }

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
}
