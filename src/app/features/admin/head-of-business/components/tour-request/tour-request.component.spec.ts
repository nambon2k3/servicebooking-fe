import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourRequestComponent } from './tour-request.component';

describe('TourRequestComponent', () => {
  let component: TourRequestComponent;
  let fixture: ComponentFixture<TourRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
