import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumPlansComponent } from './forum-plans.component';

describe('ForumPlansComponent', () => {
  let component: ForumPlansComponent;
  let fixture: ComponentFixture<ForumPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumPlansComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
