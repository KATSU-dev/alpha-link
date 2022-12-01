import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailUsagePolicyComponent } from './email-usage-policy.component';

describe('EmailUsagePolicyComponent', () => {
  let component: EmailUsagePolicyComponent;
  let fixture: ComponentFixture<EmailUsagePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailUsagePolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailUsagePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
