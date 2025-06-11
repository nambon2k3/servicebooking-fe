import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceBookingConfirmComponent } from './service-booking-confirm.component';

describe('ServiceBookingConfirmComponent', () => {
  let component: ServiceBookingConfirmComponent;
  let fixture: ComponentFixture<ServiceBookingConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceBookingConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceBookingConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
