import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelBookingManagementComponent } from './hotel-booking-management.component';

describe('HotelBookingManagementComponent', () => {
  let component: HotelBookingManagementComponent;
  let fixture: ComponentFixture<HotelBookingManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelBookingManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelBookingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
