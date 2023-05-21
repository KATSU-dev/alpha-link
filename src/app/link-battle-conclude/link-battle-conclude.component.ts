import { Component, Inject, OnInit } from '@angular/core';
import { NUMERALS } from '../combat-structures';
import { SessionService } from '../session.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Post } from '../misc-backend-structures';

@Component({
  selector: 'app-link-battle-conclude',
  templateUrl: './link-battle-conclude.component.html',
  styleUrls: ['./link-battle-conclude.component.css']
})
export class LinkBattleConcludeComponent implements OnInit {
  public canShare: boolean;
  public postChecked: boolean = true;
  public opponentResolved: boolean;
  public eloRaise: number = 0;
  public currencyRaise: number = 0;
  public tableData: Array<{field: string, value: number, reward: number, result: number}> = [
    {
      field:  "Rank",
      value:  0,
      reward: 0,
      result: 0
    },
    {
      field:  "Currency",
      value:  0,
      reward: 0,
      result: 0
    }
  ];
  private clickedNext: boolean = false;

  private tokens_a: number;
  private tokens_b: number;
  private sugar_loss: string;
  private bg: string;

  constructor(public session: SessionService,
              private http: HttpClient,
              private dialogRef: MatDialogRef<LinkBattleConcludeComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {tableData: Array<{field: string, value: number, reward: number, result: number}>, opponentResolved: boolean, canShare: boolean, tokens_a: number, tokens_b: number, sugar_loss: string, bg: string}) { 
                this.canShare = data.canShare;
                this.tableData = data.tableData;
                this.opponentResolved = data.opponentResolved;

                this.tokens_a = data.tokens_a;
                this.tokens_b = data.tokens_b;
                this.sugar_loss = data.sugar_loss;
                this.bg = data.bg;
              }

  ngOnInit(): void {
    console.log("OPPRES", this.opponentResolved);
    if(!this.opponentResolved) this.resolveOpponent();
  }

  public async next() {
    if(this.clickedNext) return;
    this.clickedNext = true;
    
    if(this.postChecked && this.canShare)
      await this.createPost();

    setTimeout(() => this.dialogRef.close(), 500);
  }

  private async createPost() {
    return new Promise((resolve, reject) => {
      let post = new Post(
        0, // id
        this.session.myUser.username, // username
        "", // title
        this.session.linkBattleData.original_challenge.challenger, // user_a
        this.session.linkBattleData.original_challenge.mon, // mon_a
        this.tokens_a, // tokens_a
        this.session.linkBattleData.response.challenger, // user_b
        this.session.linkBattleData.response.mon, // mon_b
        this.tokens_b, // tokens_b
        this.sugar_loss, // sugar_loss
        this.bg,
        0, // likes
        Date.now(), // timestamp
      );
  
      this.http.post("https://www.alphalink.app/api/user/createpost", post, {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (data) => {
            resolve("OK");
          }
        });
    });
  }

  private resolveOpponent() {
    console.log("RESOLVING OPP");
    return new Promise((resolve, reject) => {
      const opp = this.session.linkBattleData.original_challenge.challenger == this.session.myUser.username ? 
                    this.session.linkBattleData.response.challenger : this.session.linkBattleData.original_challenge.challenger;
      this.http.post<{status: string, failed?: string}>('https://www.alphalink.app/api/user/resolveuserattrition', 
                                      {username: this.session.myUsername, opponent: opp}, 
                                      {headers: {Authorization: `Bearer ${this.session.tokens.access_token}`}})
        .subscribe({
          next: (res: {status: string, failed?: string}) => {
            resolve("OK");
          },
          error: (error: any) => {
            console.log("ERROR", error);
            reject();
          },
        });
    })
  }
}