import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListTourPrivateComponent } from './view-list-tour-private.component';

describe('ViewListTourPrivateComponent', () => {
  let component: ViewListTourPrivateComponent;
  let fixture: ComponentFixture<ViewListTourPrivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewListTourPrivateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewListTourPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
