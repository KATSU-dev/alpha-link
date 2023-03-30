import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AddPartnerComponent } from '../add-partner/add-partner.component';
import { Post } from '../misc-backend-structures';
import { getScannedMon, ScannedDigimon } from '../rom-core';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';
import { IPartner, User, UserProfile } from '../user-structures';

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
  public partner_scan: boolean = true;
  public user_followed: boolean = false;
  public is_self: boolean = true;
  public partnerName!: string;
  public scannedMon!: ScannedDigimon;
  public partnerAnimationSubject: Subject<{anim: Array<string>}> = new Subject();
  public monViewState: string = "pixel";
  public monWalkAway: boolean = false;
  public extendUserBox: boolean = false;
  public hasPartner: boolean = false;

  constructor(public session: SessionService,
              private serial: SerialService,
              private router: Router,
              private http: HttpClient,
              private route: ActivatedRoute,
              public dialog: MatDialog) { 
                if(!this.session.tokens.tokensPresent()) 
                  this.router.navigate(['/']);
                else {
                  this.route.params.subscribe(params => {
                    this.username = params['username'] != null ? params['username'] : this.session.myUsername;
                    this.is_self = this.username == this.session.myUsername;
                    this.getUserProfile();
                    this.getUserPosts();

                    this.session.showTopBar = true;
                    this.session.showTopBarSearch = true;
                    this.session.topBarPlaceholderText = "Search Posts";
                  });
                }
              }

  ngOnInit(): void { }

  private getUserProfile() {
    return new Promise((resolve, reject) => {
      this.http.post<UserProfile>('https://www.alphalink.app/api/user/userprofile', 
                                            {username: this.username}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (profile: UserProfile) => {
                      this.user = Object.assign(new UserProfile(), profile);
                      this.user.fix();

                      if(this.user.partner && typeof this.user.partner !== "string") {
                        this.scannedMon = getScannedMon(this.user.partner.rom, false, this.user.partner.vpet);
                        this.partnerName = this.scannedMon.name;
                        this.monViewState = "normal";
                        this.hasPartner = true;
                        this.partner_scan = false;
                      }

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
                      this.router.navigate(['/', 'error']);
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
                        this.posts.push(new Post(post.id, post.username, post.contents, post.likes, post.timestamp, post.title, post.liked))
                      });
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
            this.user.followers += 1;
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
            this.user.followers -= 1;
            resolve("OK");
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });
    });
  }

  public canChallenge() {
    return (this.username !== this.session.myUsername && this.user.partner)
  }

  private async updateUserPartner(partner_: IPartner) {
    return new Promise((resolve, reject) => {
      this.http.post<{status: string, failed?: string}>('https://www.alphalink.app/api/user/updateuserfields', 
                                            {username: this.session.myUsername, partner: JSON.stringify(partner_)}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (res: {status: string, failed?: string}) => {
            console.log("Update User Partner:", res);
            resolve("OK");
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });
    });
  }

  public onClickAddPartner() {
    try {
      this.serial.getPort().then(() => {
      this.dialog.open(AddPartnerComponent, {
        width: '470px',
        minHeight: '230px',
        panelClass: 'custom-container'
      }).afterClosed().subscribe((partner) => {
          if(!partner) return;

          // Update data
          this.updateUserPartner(partner);
          
          if(this.session.hasChallenge()) 
            this.session.clearUserChallenge();

          this.partner_scan = false;

          // Run animations
          if(!this.user.partner) {
            this.scannedMon = getScannedMon(partner.rom, false, partner.vpet);
            this.partnerName = this.scannedMon.name;

            this.extendUserBox = true;
            setTimeout(() => {
              this.hasPartner = true;
              this.extendUserBox = false;
            }, 2000);

            this.user.partner = partner;
          }
          else {
            setTimeout(() => this.partnerAnimationSubject.next({anim: ["walk-fast", "walk-fast-1s"]}), 250);
            this.monWalkAway = true;
            setTimeout(() => {
              this.user.partner = undefined;
              this.partnerName = "";
              this.monWalkAway = false;

              this.partnerAnimationSubject.next({anim: ["pixelate-clear"]});  

              this.scannedMon = getScannedMon(partner.rom, false, partner.vpet);
              this.partnerName = this.scannedMon.name;
              this.user.partner = partner;

              setTimeout(() => {
                this.partnerAnimationSubject.next({anim: ["pixelate-load"]});  
              }, 250);
            }, 1500);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
