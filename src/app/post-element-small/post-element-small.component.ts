import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Post } from '../misc-backend-structures';
import { SessionService } from '../session.service';
import { shortToLongName } from '../rom-core';

@Component({
  selector: 'app-post-element-small',
  templateUrl: './post-element-small.component.html',
  styleUrls: ['./post-element-small.component.css']
})
export class PostElementSmallComponent implements OnInit, AfterViewInit {
  @Input('post') public post!: Post;
  @ViewChild('mon_left_div') public mon_left_div!: ElementRef;
  @ViewChild('user_left_div') public user_left_div!: ElementRef;
  @ViewChild('mon_right_div') public mon_right_div!: ElementRef;
  @ViewChild('user_right_div') public user_right_div!: ElementRef;
  public mon_a_long!: string;
  public mon_b_long!: string;
  public aWon!: boolean;
  public sugar_a!: string;
  public sugar_b!: string;
  public hovered: boolean = false;
  constructor(public http: HttpClient,
              public session: SessionService,
              public dialog: MatDialog,
              private elementRef: ElementRef,
              private router: Router) { }

  ngOnInit(): void {
    this.mon_a_long = shortToLongName(this.post.mon_a);
    this.mon_b_long = shortToLongName(this.post.mon_b);
    this.aWon = this.post.tokens_a > this.post.tokens_b;
    this.sugar_a =   this.aWon ? "YATTA" : this.post.sugar_loss;
    this.sugar_b =  !this.aWon ? "YATTA" : this.post.sugar_loss;
  }

  ngAfterViewInit(): void {
    console.log(this.post);
    this.setMonPixelSize();
    this.setUserPixelSize();
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

  public navToProfile() {
    if(this.post.username === this.session.myUsername) return;
    this.router.navigate(['/', 'profile', this.post.username]);
    this.session.sidebarSubject.next(-1);
  }

  public hover(dir: string) {
    this.hovered = dir === "in";
  }

  private setUserPixelSize() {
    const height = this.user_right_div?.nativeElement.clientHeight;
    const width = this.user_right_div?.nativeElement.clientWidth;
    console.log("User Pixel Size Width", height, width);
    this.elementRef.nativeElement.style.setProperty('--user-pixel-size', (height/32).toString());  
  }
  private setMonPixelSize() {
    const width = this.mon_left_div?.nativeElement.clientWidth;
    console.log("Mon Pixel Size Width", width);
    this.elementRef.nativeElement.style.setProperty('--mon-pixel-size', (width/16).toString());
  }
}
