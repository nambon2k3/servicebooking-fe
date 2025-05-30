import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTourGuideComponent } from './assign-tour-guide.component';

describe('AssignTourGuideComponent', () => {
  let component: AssignTourGuideComponent;
  let fixture: ComponentFixture<AssignTourGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignTourGuideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignTourGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
