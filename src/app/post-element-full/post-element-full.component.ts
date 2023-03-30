import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Post } from '../misc-backend-structures';
import { SessionService } from '../session.service';
import { profanityList } from '../user-structures';

@Component({
  selector: 'app-post-element-full',
  templateUrl: './post-element-full.component.html',
  styleUrls: ['./post-element-full.component.css']
})
export class PostElementFullComponent implements OnInit {
  public post!: Post;
  public profane_post: boolean = false;
  public comment_post: Post = new Post();
  public comments_list: Array<Post> = [];
  @ViewChild('cmnt') comment_input!: ElementRef;

  constructor(public http: HttpClient,
              public session: SessionService,
              private dialogRef: MatDialogRef<PostElementFullComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any ) {
    this.post = data.post;

    // this.session.nav_subject.subscribe({
    //   next: (switched: boolean) => {
    //     if(switched) this.dialogRef.close();
    //   }
    // });

    this.comment_post.username = this.session.myUsername;

    this.getResponses();
  }

  ngOnInit(): void { setTimeout(() => this.clickComment() , 500); }

  public profanity_check_post(): boolean {
    let prof = false;
    profanityList.forEach(word => {
      if(this.comment_post.contents.text.toLowerCase().includes(word)) prof = true;
    });
    this.profane_post = prof;
    return prof;
  }

  public sendPost() {
    if(this.comment_post.contents.text.length < 1 || this.profanity_check_post() || !/^(?!.*--)[a-zA-Z0-9,._!'\/ -?|\\@\[\]#~\n]{0,256}$/g.test(this.comment_post.contents.text)) 
      return;

    this.comment_post.timestamp = Date.now();
    // this.comment_post.response_to = this.post.id;

    let postcpy = this.comment_post.copy();
    postcpy.title = this.session.myUser.title;

    this.http.post("https://www.alphalink.app/api/user/createpost", this.comment_post, {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
      .subscribe({
        next: (data) => {
          // this.post.responses += 1;
          this.comments_list.push(postcpy);
          console.log(data);
        }
      });
      this.comment_post = new Post();
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

  public clickComment() {
    this.comment_input.nativeElement.focus();
  }

  public getResponses() {
    return new Promise((resolve, reject) => {
      this.http.post<Array<Post>>('https://www.alphalink.app/api/user/getcomments', 
                                            {username: this.session.myUsername, id: this.post.id}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (comments: Array<Post>) => {
                      comments.forEach((post: Post) => {
                        post.contents = JSON.parse(post.contents);
                        // this.comments_list.push(new Post( post.id, post.username, post.contents, post.type, post.response_to, post.responses, post.likes, post.timestamp, post.title, post.liked, 0 )) ;
                      });
                      
                      console.log("RESPO", comments);
                      console.log("FORMA", this.comments_list);

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
