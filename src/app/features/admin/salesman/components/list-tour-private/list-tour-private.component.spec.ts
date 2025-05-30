import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTourPrivateComponent } from './list-tour-private.component';

describe('ListTourPrivateComponent', () => {
  let component: ListTourPrivateComponent;
  let fixture: ComponentFixture<ListTourPrivateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTourPrivateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTourPrivateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
