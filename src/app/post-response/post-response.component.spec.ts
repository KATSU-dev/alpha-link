import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostResponseComponent } from './post-response.component';

describe('PostResponseComponent', () => {
  let component: PostResponseComponent;
  let fixture: ComponentFixture<PostResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
