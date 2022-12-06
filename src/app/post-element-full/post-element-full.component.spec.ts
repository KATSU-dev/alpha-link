import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostElementFullComponent } from './post-element-full.component';

describe('PostElementFullComponent', () => {
  let component: PostElementFullComponent;
  let fixture: ComponentFixture<PostElementFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostElementFullComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostElementFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
