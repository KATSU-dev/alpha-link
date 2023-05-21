import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkBattleConcludeComponent } from './link-battle-conclude.component';

describe('LinkBattleConcludeComponent', () => {
  let component: LinkBattleConcludeComponent;
  let fixture: ComponentFixture<LinkBattleConcludeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkBattleConcludeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkBattleConcludeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
