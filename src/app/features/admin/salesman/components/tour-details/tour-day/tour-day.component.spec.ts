import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDayComponent } from './tour-day.component';

describe('TourDayComponent', () => {
  let component: TourDayComponent;
  let fixture: ComponentFixture<TourDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
