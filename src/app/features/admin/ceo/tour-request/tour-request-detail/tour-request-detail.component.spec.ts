import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourRequestDetailComponent } from './tour-request-detail.component';

describe('TourRequestDetailComponent', () => {
  let component: TourRequestDetailComponent;
  let fixture: ComponentFixture<TourRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourRequestDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
