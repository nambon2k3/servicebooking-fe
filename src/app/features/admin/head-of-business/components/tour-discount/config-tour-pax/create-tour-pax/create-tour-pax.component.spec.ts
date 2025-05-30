import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTourPaxComponent } from './create-tour-pax.component';

describe('CreateTourPaxComponent', () => {
  let component: CreateTourPaxComponent;
  let fixture: ComponentFixture<CreateTourPaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTourPaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTourPaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
