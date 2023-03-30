import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { IChallenge } from '../combat-structures';
import { CreateChallengeComponent } from '../create-challenge/create-challenge.component';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';
import { IPartner } from '../user-structures';

@Component({
  selector: 'app-opponent-search',
  templateUrl: './opponent-search.component.html',
  styleUrls: ['./opponent-search.component.css']
})
export class OpponentSearchComponent implements OnInit, AfterViewInit {
  public stages: Array<string> = ["Baby II", "Child", "Adult", "Perfect", "Ultimate", "SuperUltimate"];
  public selectedStages: Array<string> = [];
  public challenges: Array<IChallenge> = [];

  constructor(public session: SessionService,
              private serial: SerialService,
              private router: Router,
              private http: HttpClient,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
                if(!this.session.tokens.tokensPresent()) 
                  this.router.navigate(['/']);
                this.session.showTopBar = true;
                this.session.showTopBarSearch = true;
                this.session.topBarPlaceholderText = "Search Challenges";
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
      this.getChallenges();
  }
  

  public createChallenge() {
    try {
      this.serial.getPort().then(() => {
      this.dialog.open(CreateChallengeComponent, {
        width: '470px',
        minHeight: '230px',
        panelClass: 'custom-container'
      }).afterClosed().subscribe((res) => {
        
      });
      });
    } catch (error) {
      // console.log(error);
    }
  }

  public getChallenges() {
    return new Promise((resolve, reject) => {
      this.http.post<Array<IChallenge>>('https://www.alphalink.app/api/user/getcurrentchallenges', 
                                            {username: this.session.myUsername}, 
                                            {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
                  .subscribe({
                    next: (challenges: Array<IChallenge>) => {
                      this.challenges = challenges;
                      console.log(this.challenges);
                      resolve("OK");
                    },
                    error: (error: any) => {
                      console.log("ERROR GCOS", error);
                      reject();
                    },
                  });
    });
  }
}
