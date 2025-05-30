import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTourPublicComponent } from './list-tour-public.component';

describe('ListTourPublicComponent', () => {
  let component: ListTourPublicComponent;
  let fixture: ComponentFixture<ListTourPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListTourPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListTourPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
