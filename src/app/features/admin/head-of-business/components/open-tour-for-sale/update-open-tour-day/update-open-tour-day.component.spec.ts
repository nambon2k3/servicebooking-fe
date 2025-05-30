import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOpenTourDayComponent } from './update-open-tour-day.component';

describe('UpdateOpenTourDayComponent', () => {
  let component: UpdateOpenTourDayComponent;
  let fixture: ComponentFixture<UpdateOpenTourDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateOpenTourDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateOpenTourDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
