import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourDetailsLayoutComponent } from './tour-details-layout.component';

describe('TourDetailsLayoutComponent', () => {
  let component: TourDetailsLayoutComponent;
  let fixture: ComponentFixture<TourDetailsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourDetailsLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourDetailsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
