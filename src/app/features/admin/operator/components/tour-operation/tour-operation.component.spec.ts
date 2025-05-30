import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourOperationComponent } from './tour-operation.component';

describe('TourOperationComponent', () => {
  let component: TourOperationComponent;
  let fixture: ComponentFixture<TourOperationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourOperationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourOperationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
