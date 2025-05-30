import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketBookingManagementComponent } from './ticket-booking-management.component';

describe('TicketBookingManagementComponent', () => {
  let component: TicketBookingManagementComponent;
  let fixture: ComponentFixture<TicketBookingManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketBookingManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketBookingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
