import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-custom-text',
  templateUrl: './custom-text.component.html',
  styleUrls: ['./custom-text.component.css']
})
export class CustomTextComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input('text') text!: string | number;
  @ViewChild('container') container!: ElementRef;
  public text_list: Array<string> = [];
  private checkLoopRef!: any;
  
  constructor(private elementRef: ElementRef) { }

  ngOnInit(): void {
    if(typeof this.text == 'number') this.text = this.text.toString();
    
    if(this.text == "bits")
      this.text_list = ["bits"];
    else 
      this.text_list = this.text.split("");

    
    this.checkLoopRef = setInterval(() => {
      if(typeof this.text == 'number') this.text = this.text.toString();
      
      if(this.text == "bits")
        this.text_list = ["bits"];
      else 
        this.text_list = this.text.split("");

    }, 500);
    
  }

  ngAfterViewInit(): void {
    if(this.setTextSize() < 16) {
      setTimeout(() => {
        if(this.setTextSize() < 16) {
          setTimeout(() => {
            !this.setTextSize()
          }, 1000);
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.checkLoopRef);
  }

  private setTextSize() {
    const height = this.container?.nativeElement.clientHeight;
    this.elementRef.nativeElement.style.setProperty('--height', (height).toString());
    return height;
  }
}
