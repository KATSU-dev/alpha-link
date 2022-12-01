import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvatarLayeredViewComponent } from './avatar-layered-view.component';

describe('AvatarLayeredViewComponent', () => {
  let component: AvatarLayeredViewComponent;
  let fixture: ComponentFixture<AvatarLayeredViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvatarLayeredViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarLayeredViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
