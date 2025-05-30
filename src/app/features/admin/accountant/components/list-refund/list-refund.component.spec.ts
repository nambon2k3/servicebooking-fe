import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRefundComponent } from './list-refund.component';

describe('ListRefundComponent', () => {
  let component: ListRefundComponent;
  let fixture: ComponentFixture<ListRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRefundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
