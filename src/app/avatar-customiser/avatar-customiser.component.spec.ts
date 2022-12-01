import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarCustomiserComponent } from './avatar-customiser.component';

describe('AvatarCustomiserComponent', () => {
  let component: AvatarCustomiserComponent;
  let fixture: ComponentFixture<AvatarCustomiserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvatarCustomiserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarCustomiserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
