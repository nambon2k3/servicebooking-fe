import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTourDayComponent } from './create-tour-day.component';

describe('CreateTourDayComponent', () => {
  let component: CreateTourDayComponent;
  let fixture: ComponentFixture<CreateTourDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTourDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTourDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
