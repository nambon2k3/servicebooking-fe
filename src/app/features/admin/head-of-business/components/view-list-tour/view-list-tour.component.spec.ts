import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListTourComponent } from './view-list-tour.component';

describe('ViewListTourComponent', () => {
  let component: ViewListTourComponent;
  let fixture: ComponentFixture<ViewListTourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewListTourComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewListTourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
