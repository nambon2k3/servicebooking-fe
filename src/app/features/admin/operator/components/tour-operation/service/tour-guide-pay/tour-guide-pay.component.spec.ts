import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourGuidePayComponent } from './tour-guide-pay.component';

describe('TourGuidePayComponent', () => {
  let component: TourGuidePayComponent;
  let fixture: ComponentFixture<TourGuidePayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourGuidePayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourGuidePayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
