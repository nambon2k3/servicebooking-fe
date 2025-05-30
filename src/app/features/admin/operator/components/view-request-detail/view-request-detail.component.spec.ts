import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRequestDetailComponent } from './view-request-detail.component';

describe('ViewRequestDetailComponent', () => {
  let component: ViewRequestDetailComponent;
  let fixture: ComponentFixture<ViewRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRequestDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
