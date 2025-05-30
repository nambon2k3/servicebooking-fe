import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTransportationComponent } from './add-transportation.component';

describe('AddTransportationComponent', () => {
  let component: AddTransportationComponent;
  let fixture: ComponentFixture<AddTransportationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTransportationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTransportationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
