import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeResponseComponent } from './challenge-response.component';

describe('ChallengeResponseComponent', () => {
  let component: ChallengeResponseComponent;
  let fixture: ComponentFixture<ChallengeResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChallengeResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
