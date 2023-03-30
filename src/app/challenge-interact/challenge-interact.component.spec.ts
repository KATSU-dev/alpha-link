import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeInteractComponent } from './challenge-interact.component';

describe('ChallengeInteractComponent', () => {
  let component: ChallengeInteractComponent;
  let fixture: ComponentFixture<ChallengeInteractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChallengeInteractComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeInteractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
