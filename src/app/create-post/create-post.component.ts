import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Post } from '../misc-backend-structures';
import { SessionService } from '../session.service';
import { profanityList } from '../user-structures';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent implements OnInit {
  public profane_post: boolean = false;
  public post: Post = new Post();

  constructor(public session: SessionService,
              public http: HttpClient,
              private dialogRef: MatDialogRef<CreatePostComponent>,) { }

  ngOnInit(): void {
    this.post.username = this.session.myUsername;
  }

  public profanity_check_post(): boolean {
    let prof = false;
    profanityList.forEach(word => {
      if(this.post.contents.text.toLowerCase().includes(word)) prof = true;
    });
    this.profane_post = prof;
    return prof;
  }

  public sendPost() {
    console.log(this.post);

    if(this.post.contents.text.length < 1 || this.profanity_check_post() || !/^(?!.*--)[a-zA-Z0-9,._!'\/ -?|\\@\[\]#~\n]{0,256}$/g.test(this.post.contents.text)) 
      return;

    this.post.timestamp = Date.now();

    this.http.post("https://www.alphalink.app/api/user/createpost", this.post, {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
      .subscribe({
        next: (data) => {
          console.log(data);
          this.exit();
        }
      });
    // 
  }

  private exit() {
    this.dialogRef.close();
  }
}
