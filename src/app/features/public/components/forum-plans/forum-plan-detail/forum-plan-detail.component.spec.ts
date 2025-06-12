import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumPlanDetailComponent } from './forum-plan-detail.component';

describe('ForumPlanDetailComponent', () => {
  let component: ForumPlanDetailComponent;
  let fixture: ComponentFixture<ForumPlanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumPlanDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumPlanDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
