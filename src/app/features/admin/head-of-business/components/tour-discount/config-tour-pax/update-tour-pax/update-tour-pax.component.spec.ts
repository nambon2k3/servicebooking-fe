import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateTourPaxComponent } from './update-tour-pax.component';

describe('UpdateTourPaxComponent', () => {
  let component: UpdateTourPaxComponent;
  let fixture: ComponentFixture<UpdateTourPaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateTourPaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateTourPaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
