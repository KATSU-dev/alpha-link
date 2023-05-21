import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { vpet, vpet_name_to_commtype, vpet_types, vpet_lengths } from '../rom-core';
import { commTypesList, convertRom, convertSerialResponse, INERTROMS } from '../rom-manager';
import { SerialService } from '../serial.service';
import { SessionService } from '../session.service';
import { IPartner } from '../user-structures';

@Component({
  selector: 'app-add-partner',
  templateUrl: './add-partner.component.html',
  styleUrls: ['./add-partner.component.css']
})
export class AddPartnerComponent implements OnInit, AfterViewInit {
  public partner: IPartner = {rom:"", vpet: "", expires: -1};
  public vpetTypeSelected: vpet = "";
  public vpetSelected: number = -1;
  public vpetHovered: number = -1;
  public sliderIndex: number = 0;
  public commTypeSelected: boolean = false;

  private completed: boolean = false;

  constructor(public http: HttpClient,
              public session: SessionService,
              public serial: SerialService,
              private dialogRef: MatDialogRef<AddPartnerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any ) {
                dialogRef.afterClosed().subscribe(result => {
                  if(!this.completed) this.serial.closePort();
                });
              }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.serialSetup();
  }
  private async serialSetup() {
    await this.serial.openPort().catch(console.log);
    await this.serial.initialisePort().catch(console.log);
    await this.serial.listenToSerialPortTwo().catch(console.log);

    this.serial.serial_status.subscribe(status => {
      if(!status) this.dialogRef.close();
    });
  }

  public onVpetSelect(index: number) {
    if(this.commTypeSelected) return;
    this.vpetSelected = index;
    this.vpetTypeSelected = vpet_types[index] as vpet;
    this.sendInertCode();
  }
  public onVpetHover(index: number) {
    if(this.commTypeSelected) return;
    this.vpetHovered = index;
    this.vpetTypeSelected = vpet_types[index] as vpet;
  }
  public onVpetHoverOut() {
    if(this.commTypeSelected) return;
    this.vpetHovered = this.vpetSelected;
    this.vpetTypeSelected = vpet_types[this.vpetSelected] as vpet;
  }

  public async next() {
    this.commTypeSelected = true;
    setTimeout(() => this.sliderIndex = (this.sliderIndex + 1) % 2, 1500);
    setTimeout(() => this.getDigiROM().then(ROM => this.digiROMAcquired(ROM)), 500);
  }

  private sendInertCode() {
    console.log(this.vpetTypeSelected, INERTROMS[vpet_name_to_commtype[this.vpetTypeSelected]]);

    if(this.serial.isPortInitialised) {
      this.serial.sendSerial( `${INERTROMS[vpet_name_to_commtype[this.vpetTypeSelected]]}\n` );
    }
    else {
      const loopRef = setInterval(() => {
        if(!this.serial.isPortInitialised) return;
        this.serial.sendSerial( `${INERTROMS[vpet_name_to_commtype[this.vpetTypeSelected]]}\n` );
        clearInterval(loopRef);
      }, 250);
    }
  }

  private getDigiROM() {
    return new Promise<string>((resolve, reject) => {
      const loop = () => {
        this.serial.getComLine().then(line => {
          console.log("COMLINE: ", line);
          const matches = line.match(new RegExp('r', 'g'));
          const len =  matches ? matches.length : 0;

          if(len < vpet_lengths[this.vpetTypeSelected]) loop();
          else resolve(line);
        });
      }
      loop();
    });
  }

  private digiROMAcquired(ROM: string) {
    this.partner.rom = convertSerialResponse(ROM.replace(" \r", ""));
    this.partner.vpet = this.vpetTypeSelected;
    this.partner.expires = Date.now() + 21600000; // 6hrs
    // this.partner.expires = Date.now() + 10000;  // 10s;

    console.log(this.partner);
    this.session.setUserPartner(this.partner);
    this.dialogRef.close(this.partner);
  }
}
