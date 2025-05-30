import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDiscountComponent } from './tour-discount.component';

describe('TourDiscountComponent', () => {
  let component: TourDiscountComponent;
  let fixture: ComponentFixture<TourDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourDiscountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
