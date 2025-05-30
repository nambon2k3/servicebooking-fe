import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourListBookingComponent } from './tour-list-booking.component';

describe('TourListBookingComponent', () => {
  let component: TourListBookingComponent;
  let fixture: ComponentFixture<TourListBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourListBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourListBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
