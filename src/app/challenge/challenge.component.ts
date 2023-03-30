import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChallengeInteractComponent } from '../challenge-interact/challenge-interact.component';
import { IChallenge } from '../combat-structures';
import { shortToLongName, stage, STAGES_R, stage_r } from '../rom-core';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.css']
})
export class ChallengeComponent implements OnInit {
  @Input('challenge') challenge: IChallenge = {
    id: 0,
    challenger: "Taken",
    title: "Newbie",
    target: "challenge/global",
    global: true,
    accepted: false,
    type: "DM20",
    bg: "backdrop_grassy_plains",
    mon: "agu",
    stage: "III",
    rom: "FC03-FD02",
    timestamp: -1
  }
  @Input('showButton') showButton: boolean = true;
  public isOwn: boolean = false;
  public monName!: string;
  public monStage!: string;
  constructor(public session: SessionService,
              private serial: SerialService,
              private dialog: MatDialog,
              private router: Router) { }

  ngOnInit(): void {
    this.isOwn = this.challenge.challenger === this.session.myUser.username;
    this.monName = shortToLongName(this.challenge.mon);
  }

  public accept() {
    try {
      // await this.serial.getPort();
      this.dialog.open(ChallengeInteractComponent, {
        width: '632px',
        minHeight: '288px',
        data: {op: "accept", challenge: this.challenge},
        panelClass: 'custom-container'
      }).afterClosed().subscribe((accepted: boolean) => {
        if(accepted) {
          this.router.navigate(['/', 'linkbattle']);
        }
      });
      
    } catch (error) {
      console.log(error);
    }
  }

  public async cancel() {
    try {
      // await this.serial.getPort();
      this.dialog.open(ChallengeInteractComponent, {
        width: '470px',
        minHeight: '230px',
        data: {op: "cancel"},
        panelClass: 'custom-container'
      }).afterClosed().subscribe((destroy: boolean) => {
        console.log("DESTROY:", destroy);
        if(destroy) this.session.clearUserChallenge();
      });
      
    } catch (error) {
      console.log(error);
    }
  }
}
