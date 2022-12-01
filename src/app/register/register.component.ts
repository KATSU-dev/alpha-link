import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Marvin, MarvinImage } from 'marvinj-ts';
import { profanityList, RegisterCredentials } from '../user-structures';
import { SessionService } from '../session.service';
import { EmailUsagePolicyComponent } from '../email-usage-policy/email-usage-policy.component';
import { TermsAndConditionsComponent } from '../terms-and-conditions/terms-and-conditions.component';
import { generateDefaultWardrobe, generateFullWardrobe, Wearing } from '../user-structures';
import { MatStepper } from '@angular/material/stepper';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  constructor(private http: HttpClient, 
              private router: Router,
              public session: SessionService, 
              private snackBar: MatSnackBar,
              private dialog: MatDialog) { }

  public registerCreds = new RegisterCredentials("Taken", 't@ak.en', 'wowowowowow1', new Wearing(), '', false, false);
  // public registerCreds = new RegisterCredentials();
  public wardrobe = generateFullWardrobe();

  public valid_account: boolean = false;
  public valid_avatar: boolean = false;
  public usernameTaken: boolean = false;
  public profane_username: boolean = false;
  public profane_bio: boolean = false;
  public hide: boolean = true;
  public age_checked: boolean = false;

  ngOnInit(): void {
  }

  public username_out() {
    this.http.post("https://www.alphalink.app/api/user/checkavailable", { username: this.registerCreds.username }).subscribe((res: any) => {
      this.usernameTaken = (res.status === "Taken");
    });
  }

  public profanity_check_username() {
    let prof = false;
    profanityList.forEach(word => {
      if(this.registerCreds.username.toLowerCase().includes(word)) prof = true;
    });
    this.profane_username = prof;
  }

  public profanity_check_bio() {
    let prof = false;
    profanityList.forEach(word => {
      if(this.registerCreds.profile_text.toLowerCase().includes(word)) prof = true;
    });
    this.profane_bio = prof;
  }

  public openDialog(type: 't_c' | 'r_e') {
    console.log(type);
    if(type === 't_c'){
      let prev = this.registerCreds.t_c;
      this.dialog.open(TermsAndConditionsComponent, {height: "85vh", width: "35rem", maxWidth: "80vw"})
        .afterOpened().subscribe(() => {
          this.registerCreds.t_c = prev;
        });
    }
    else {
      let prev = this.registerCreds.r_e;
      this.dialog.open(EmailUsagePolicyComponent, {height: "85vh", width: "35rem", maxWidth: "80vw"})
        .afterOpened().subscribe(() => {
          this.registerCreds.r_e = prev;
        });
    }
    
  }

  private postImage(fd: FormData) {
    return new Promise((resolve, reject) => {
      try {
        this.http.post(`https://www.alphalink.app/api/user/avatar/upload/${this.registerCreds.username}`, fd)
          .subscribe({
            next: (res: any) => {
              resolve("OK");
            }, 
            error: (error: any) => {
              reject(error);
            }
          });
      } catch (error) {
        reject(error);
      }
    });    
  }

  public register() {
    // Check bio validity
    if(this.profane_bio) return;
    if(!this.registerCreds.checkBioValidity()) {
      this.snackBar.open('Bio contains invalid characters.', '', {duration: 3000});
      return;
    }

    // Confirm Terms and Conditions are agreed to.
    if(!this.registerCreds.t_c) {
      this.snackBar.open('You must agree to the Terms and Conditions to register an account with Alpha Link.', '', {duration: 3000});
      return;
    }

    // Confirm 13 or older.
    if(!this.age_checked) {
      this.snackBar.open('You must be at least 13 years of age to register an account with Alpha Link.', '', {duration: 3000});
      return;
    }


    // Final check if username still available before continuing.
    this.http.post("https://www.alphalink.app/api/user/checkavailable", { username: this.registerCreds.username })
      .subscribe({
          next: (res: any) => {
            this.usernameTaken = (res.status === "Taken");
            if(this.usernameTaken) {
              this.snackBar.open('Another user has taken this username. \nPlease try another username.', '', {duration: 4000});
              return;
            }
      
            // If all else successful, create user.
            this.http.post("https://www.alphalink.app/api/user/createuser", this.registerCreds.toJSON())
              .subscribe({
                next: async (res: any) => {                
                  // Account created successfully. Now upload avatar img.
                  const blob: Blob = (await this.registerCreds.generateMergedImageBlob()) as Blob;
                  let fd = new FormData();
                  fd.append('image', blob);
                  this.postImage(fd)
                    .then(() => {
                      this.snackBar.open("Account Created!", '', {duration: 3000});
                      this.router.navigate(['/']);
                    })
                    .catch(() => {
                      this.snackBar.open("Error occurred while uploading avatar.", '', {duration: 3000});
                      this.router.navigate(['/']);
                    });
                }, 

                error: (error: any) => {
                  switch(error.error.failed) {
                    case "username":
                      this.snackBar.open('Oh no, another user has taken this username. Please try another username...', '', {duration: 4000});
                      break;
                    case "email":
                      this.snackBar.open('This email address is already in use.', '', {duration: 4000});
                      break;
                    default:
                      this.snackBar.open('Oops... Something went wrong. Please contact an administrator for help.', '', {duration: 4000});
                      console.log(error);
                      break;
                  }
                }
              });
          },

          error: (error: any) => {
            console.log(error);
            this.snackBar.open('Something went wrong. Contact and administrator for help.', '', {duration: 4000});
          }
        });
  }

  public detailsComplete() {
    this.valid_avatar = true;
  }

  public stepNext(stepper: MatStepper) {
    stepper.next();
  }
  public stepBack(stepper: MatStepper) {
    stepper.previous();
  }
}
