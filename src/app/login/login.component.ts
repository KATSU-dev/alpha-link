import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../session.service';
import { ITokens } from '../tokens';
import { UserCredentials } from '../user-structures';
import { User } from '../user-structures';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private http: HttpClient, 
              public session: SessionService, 
              private router: Router,
              private snackBar: MatSnackBar,) {
  }

  // public userCreds = new UserCredentials('', '');
  public userCreds = new UserCredentials('Taken', 'Wowowowowow1!');
  public hide_password:boolean = true;
  public goto: string = '/home';

  ngOnInit(): void {
    if(this.session.tokens.tokensPresent()) 
      this.router.navigate([this.goto]);
  }

  public login() {
    if(!this.userCreds.validate()) {
      console.log("Invalid Input.");
      this.snackBar.open("Incorrect login details.", '',  {duration: 4000});
      return;
    }

    this.http.post<ITokens>("https://www.alphalink.app/aut/user/login", this.userCreds.toJSON()).subscribe({
      next: (data: ITokens) => {
        this.session.tokens.setTokens(data.accessToken, data.refreshToken);
        this.session.showSideBar = true;
        this.session.myUsername = this.userCreds.username;

        this.http.post<User>("https://www.alphalink.app/api/user/getuser", {username: this.session.myUsername}, {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}}).subscribe({
          next: (user: User) => {
            this.session.setUser(user);

            this.userCreds.clear();
            this.router.navigate([this.goto]);
          },
          error: (error) => {
            console.log("ERROR B HERE", error);
            this.snackBar.open("Something went wrong... Contact an administrator for help.", '',  {duration: 4000});
            console.log(error);
          },
        });
      },
      error: (error: any) => {
        console.log("ERROR A HERE", error);
        if(error.error.failed === "User not found" || error.error.failed === "Login Incorrect") 
           this.snackBar.open("Incorrect login details.", '',  {duration: 4000});
        else {
          this.snackBar.open("Something went wrong... Contact an administrator for help.", '',  {duration: 4000});
          console.log(error);
        }
        this.userCreds.clear();
      }
    });
  }
}
