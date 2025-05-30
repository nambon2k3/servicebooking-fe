import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayServiceComponent } from './pay-service.component';

describe('PayServiceComponent', () => {
  let component: PayServiceComponent;
  let fixture: ComponentFixture<PayServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
