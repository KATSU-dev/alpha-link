import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkBattleDisplayComponent } from './link-battle-display.component';

describe('LinkBattleDisplayComponent', () => {
  let component: LinkBattleDisplayComponent;
  let fixture: ComponentFixture<LinkBattleDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkBattleDisplayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkBattleDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
