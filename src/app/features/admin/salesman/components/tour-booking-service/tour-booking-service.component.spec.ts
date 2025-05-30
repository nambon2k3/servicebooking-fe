import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourBookingServiceComponent } from './tour-booking-service.component';

describe('TourBookingServiceComponent', () => {
  let component: TourBookingServiceComponent;
  let fixture: ComponentFixture<TourBookingServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourBookingServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourBookingServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
