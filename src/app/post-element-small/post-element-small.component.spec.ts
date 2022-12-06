import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostElementSmallComponent } from './post-element-small.component';

describe('PostElementSmallComponent', () => {
  let component: PostElementSmallComponent;
  let fixture: ComponentFixture<PostElementSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostElementSmallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostElementSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
