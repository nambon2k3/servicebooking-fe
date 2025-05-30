import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListRequestComponent } from './view-list-request.component';

describe('ViewListRequestComponent', () => {
  let component: ViewListRequestComponent;
  let fixture: ComponentFixture<ViewListRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewListRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewListRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
