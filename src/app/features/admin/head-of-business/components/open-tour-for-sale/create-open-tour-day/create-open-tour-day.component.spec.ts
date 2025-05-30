import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOpenTourDayComponent } from './create-open-tour-day.component';

describe('CreateOpenTourDayComponent', () => {
  let component: CreateOpenTourDayComponent;
  let fixture: ComponentFixture<CreateOpenTourDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOpenTourDayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOpenTourDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
