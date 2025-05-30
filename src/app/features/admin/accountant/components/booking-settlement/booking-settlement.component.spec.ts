import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingSettlementComponent } from './booking-settlement.component';

describe('BookingSettlementComponent', () => {
  let component: BookingSettlementComponent;
  let fixture: ComponentFixture<BookingSettlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSettlementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingSettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
