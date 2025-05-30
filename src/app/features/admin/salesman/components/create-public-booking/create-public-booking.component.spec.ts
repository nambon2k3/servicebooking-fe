import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePublicBookingComponent } from './create-public-booking.component';

describe('CreatePublicBookingComponent', () => {
  let component: CreatePublicBookingComponent;
  let fixture: ComponentFixture<CreatePublicBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePublicBookingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePublicBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
