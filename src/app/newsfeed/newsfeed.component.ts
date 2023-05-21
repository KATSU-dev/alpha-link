import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Post } from '../misc-backend-structures';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.component.html',
  styleUrls: ['./newsfeed.component.css']
})
export class NewsfeedComponent implements OnInit {
  public posts: Array<Post> = [];
  constructor(public session: SessionService,
              public http: HttpClient,
              private router: Router) { 
                this.session.showTopBar = true;
                this.session.showTopBarSearch = true;
                this.session.topBarPlaceholderText = "Search Posts";
              }

  ngOnInit(): void {
    if(!this.session.tokens.tokensPresent()) 
    this.router.navigate(['/']);
  else {
    this.getUserPosts();
  }
  }

  private getPriorityValue(post: Post) {
    let val = 0;
    let time_diff = (Date.now() - post.timestamp) / 1800000;
    if(time_diff < 2) time_diff = 2;

    val += 150 * ( 1/( Math.log10(time_diff) ) );
    val += 250 * Math.log10(post.likes == 0 ? 1 : post.likes );

    // Add *1.25 and + 250 if following
    return val;
  }

  private getUserPosts() {
    return new Promise((resolve, reject) => {
      this.http.post<{following: Array<Post>, remainder?: Array<Post>}>('https://www.alphalink.app/api/user/getnewsfeed', 
                                            // {username: this.session.myUsername, restrict: this.session.myUser.settings.newsfeed_restrict}, 
                                            {username: this.session.myUsername, restrict: false}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (posts: {following: Array<Post>, remainder?: Array<Post>}) => {
                      let f_posts: Post[] = [], r_posts: Post[] = [];
                      
                      posts.following.forEach((post: Post) => {
                        const priority = ((this.getPriorityValue(post)*1.5)+250);
                        post.priority = priority;
                        f_posts.push(post);
                      });

                      if(posts.remainder) {
                        posts.remainder.forEach((post: Post) => {
                          const priority = this.getPriorityValue(post);
                          post.priority = priority;
                          r_posts.push(post);
                        });
                      }

                      this.posts = [...f_posts, ...r_posts];
                      this.posts.sort((a: Post, b: Post) => (b.priority || 0) - (a.priority || 0));

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
