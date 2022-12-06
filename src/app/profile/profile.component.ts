import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../misc-backend-structures';
import { SessionService } from '../session.service';
import { User, UserProfile } from '../user-structures';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private username!: string;
  public user!: UserProfile;
  public posts: Array<Post> = [];
  public status_indicator!: boolean;
  public user_followed: boolean = false;
  public is_self: boolean = true;

  constructor(public session: SessionService,
              private router: Router,
              private http: HttpClient,
              private route: ActivatedRoute) { 
              }

  ngOnInit(): void {
    if(!this.session.tokens.tokensPresent()) 
      this.router.navigate(['/']);
    else {
      this.route.params.subscribe(params => {
        this.username = params['username'] != null ? params['username'] : this.session.myUsername;
        this.is_self = this.username == this.session.myUsername;
        this.getUserProfile();
        this.getUserPosts();
      });
    }
  }

  private getUserProfile() {
    return new Promise((resolve, reject) => {
      this.http.post<UserProfile>('https://www.alphalink.app/api/user/userprofile', 
                                            {username: this.username}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (profile: UserProfile) => {
                      this.user = profile;
                      this.status_indicator = (this.user != null) ? (this.user.last_seen + 900000) > Date.now() : false;

                      if(profile.relationship.length == 0) this.user_followed = false;
                      else {
                        profile.relationship.forEach((item:any) => {
                          if(item.type == 'following') this.user_followed = true;
                        });
                      }
                      
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("ERROR", error);
                      reject();
                    },
                  });
    });
  }
  private getUserPosts() {
    return new Promise((resolve, reject) => {
      this.http.post<Array<Post>>('https://www.alphalink.app/api/user/getuserposts', 
                                            {username: this.username}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (posts: Array<Post>) => {
                      posts.forEach((post: Post) => {
                        post.contents = JSON.parse(post.contents);
                        this.posts.push(new Post(post.id, post.username, post.contents, post.type, post.response_to, post.likes, post.timestamp))
                      });
                      console.log(this.posts);
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("ERROR", error);
                      reject();
                    },
                  });
    });
  }
  

  private followUser() {
    return new Promise((resolve, reject) => {
      this.http.post<{status: string, failed?: string}>('https://www.alphalink.app/api/user/follow', 
                                            {username: this.session.myUsername, user_b: this.username}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (res: {status: string, failed?: string}) => {
            this.user_followed = true;
            resolve("OK");
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });
    });
  }

  private unfollowUser() {
    return new Promise((resolve, reject) => {
      this.http.post<{status: string, failed?: string}>('https://www.alphalink.app/api/user/unfollow', 
                                            {username: this.session.myUsername, user_b: this.username}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (res: {status: string, failed?: string}) => {
            this.user_followed = false;
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
