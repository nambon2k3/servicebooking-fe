import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourOperationLayoutComponent } from './tour-operation-layout.component';

describe('TourOperationLayoutComponent', () => {
  let component: TourOperationLayoutComponent;
  let fixture: ComponentFixture<TourOperationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourOperationLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourOperationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
