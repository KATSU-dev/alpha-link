import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonViewComponent } from './mon-view.component';

describe('MonViewComponent', () => {
  let component: MonViewComponent;
  let fixture: ComponentFixture<MonViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
