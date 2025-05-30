import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenTourForSaleComponent } from './open-tour-for-sale.component';

describe('OpenTourForSaleComponent', () => {
  let component: OpenTourForSaleComponent;
  let fixture: ComponentFixture<OpenTourForSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenTourForSaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenTourForSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
