import { Component, OnInit, Input } from '@angular/core';
import { generateDefaultWardrobe, IWardrobe, SelectorsType, sTypetoIType, Wearing, wearingUtils } from '../user-structures';

@Component({
  selector: 'app-avatar-customiser',
  templateUrl: './avatar-customiser.component.html',
  styleUrls: ['./avatar-customiser.component.css']
})
export class AvatarCustomiserComponent implements OnInit {
  @Input('wearing') wearing!: Wearing;
  @Input('wardrobe') wardrobe!: IWardrobe;
  

  public cursors = {
    base: 1,
    eyes: 0,
    blush: 0,
    lips: 0,
    upper: 1,
    lower: 1,
    shoes: 1,
    hair: 2,
    beard: 0,
    glasses: 0,
    hat: 3,
  }

  constructor() { }

  ngOnInit(): void {
  }

  public shift(dir: string, selType: SelectorsType) {
    const shift_val = ((dir === "left") ? -1 : 1);
    let st_c = this.cursors[sTypetoIType(selType)];

    switch (selType) {
      case "hair":  {           // Change only hair item
        const e_c = (this.cursors.hair+14 > this.wardrobe.hair.length) || (this.cursors.hair-14 < 0);  // Edge cases

        // Jump 14 positions to new style. If currently 0, move to 1.
        const hair_shift_val = (shift_val * 14) + (this.cursors.hair === 0 ? 1 : 0); 

        // Set new cursor value
        
        this.cursors.hair += hair_shift_val;    // Shift cursor val
        if(this.cursors.hair <= 0)                           this.cursors.hair = this.wardrobe.hair.length + this.cursors.hair - 1;
        if(this.cursors.hair >= this.wardrobe.hair.length)   this.cursors.hair = (this.cursors.hair % this.wardrobe.hair.length) + 1;
        // this.cursors.hair += this.wardrobe.hair.length;
        // this.cursors.hair %= this.wardrobe.hair.length;

        // Apply new slot
        const newSlot = this.wardrobe.hair[this.cursors.hair]
        this.wearing.hair.item = newSlot.item;
        this.wearing.hair.variant = newSlot.variant;

        break;
      }
      case "haircolour": {      // Change only hair variant
        const e_c = (this.cursors.hair % 14 === 0) && (this.cursors.hair !== 0);  // Edge cases
        const lim_low   = (Math.floor( this.cursors.hair / 14) * 14) - ((e_c ? 1 : 0) * 14);
        const lim_high  = lim_low + 14;

        // Set new cursor value
        this.cursors.hair += shift_val;                                 // Shift cursor val
        if(this.cursors.hair <= lim_low) this.cursors.hair = lim_high;  // Wrap around limits
        if(this.cursors.hair > lim_high) this.cursors.hair = lim_low+1;

        // Apply new slot
        const newSlot = this.wardrobe.hair[this.cursors.hair]
        this.wearing.hair.item = newSlot.item;
        this.wearing.hair.variant = newSlot.variant;

        break;
      } 
      default: {
        if(this.wardrobe[selType].length === 0) break;  // If none in wardrobe, break

        // Set new cursor value
        this.cursors[selType] += shift_val;     // Shift cursor val
        this.cursors[selType] += this.wardrobe[selType].length;
        this.cursors[selType] %= this.wardrobe[selType].length;

        // Apply new slot
        const newSlot = this.wardrobe[selType][this.cursors[selType]]
        this.wearing[selType].item = newSlot.item;
        this.wearing[selType].variant = newSlot.variant;
        break;
      } 
    }
  }
}