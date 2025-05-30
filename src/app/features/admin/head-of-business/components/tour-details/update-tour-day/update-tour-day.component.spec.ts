import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTourDayComponent } from './update-tour-day.component';

describe('UpdateTourDayComponent', () => {
  let component: UpdateTourDayComponent;
  let fixture: ComponentFixture<UpdateTourDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTourDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateTourDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
