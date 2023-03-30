import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkBattleComponent } from './link-battle.component';

describe('LinkBattleComponent', () => {
  let component: LinkBattleComponent;
  let fixture: ComponentFixture<LinkBattleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkBattleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkBattleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
