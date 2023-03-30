import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-pill',
  templateUrl: './pill.component.html',
  styleUrls: ['./pill.component.css']
})
export class PillComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  @Input('type') type!: string;
  @Input('unit') unit!: string;

  constructor(private elementRef: ElementRef) { }

  public serifFont: string = "'Times New Roman', Times, serif";

  public contents: IContents = {
    DMOG: {
      text: "DMOG",
      style: {
        backgroundColor: "#0D5C63",
      },
    }, 
    PENOG: {
      text: "PENOG",
      style: {
        backgroundColor: "#2FC6B0",
      },
    }, 
    DM20: {
      text: "DM20",
      style: {
        backgroundColor: "orange",
      },
    }, 
    PEN20: {
      text: "PEN20",
      style: {
        backgroundColor: "#33EBFF",
      },
    }, 
    DMX: {
      text: "DMX",
      style: {
        backgroundColor: "purple",
      },
    }, 
    PENX: {
      text: "PENX",
      style: {
        backgroundColor: "#2B2567",
      },
    }, 
    PENPROG: {
      text: "PENPROG",
      style: {
        backgroundColor: "#E9B06E",
      },
    },
    I: {
      text: "I",
      style: {
        fontFamily: this.serifFont,
        backgroundColor: "#999999",
      },
    }, 
    II: {
      text: "II",
      style: {
        fontFamily: this.serifFont,
        backgroundColor: "#8f8f8f",
      },
    }, 
    III: {
      text: "III",
      style: {
        fontFamily: this.serifFont,
        backgroundColor: "#858585",
      },
    }, 
    IV: {
      text: "IV",
      style: {
        fontFamily: this.serifFont,
        backgroundColor: "#7a7a7a",
      },
    }, 
    V: {
      text: "V",
      style: {
        fontFamily: this.serifFont,
        backgroundColor: "#707070",
      },
    }, 
    VI: {
      text: "VI",
      style: {
        fontFamily: this.serifFont,
        backgroundColor: "#656565",
      },
    }, 
    VII: {
      text: "VII",
      style: {
        fontFamily: this.serifFont,
        backgroundColor: "#5c5c5c",
      },
    },
  }

  ngOnInit(): void {
    this.elementRef.nativeElement.style.setProperty('--unit', this.unit);
  }

  public getContents(type: string) {
    return this.contents[type as keyof IContents];
  }
}


interface IContents {
  DMOG: {
    text: string,
    style: object;
  }, 
  PENOG: {
    text: string,
    style: object;
  }, 
  DM20: {
    text: string,
    style: object;
  }, 
  PEN20: {
    text: string,
    style: object;
  }, 
  DMX: {
    text: string,
    style: object;
  }, 
  PENX: {
    text: string,
    style: object;
  }, 
  PENPROG: {
    text: string,
    style: object;
  },
  I: {
    text: string,
    style: object;
  }, 
  II: {
    text: string,
    style: object;
  }, 
  III: {
    text: string,
    style: object;
  }, 
  IV: {
    text: string,
    style: object;
  }, 
  V: {
    text: string,
    style: object;
  }, 
  VI: {
    text: string,
    style: object;
  }, 
  VII: {
    text: string,
    style: object;
  },
}