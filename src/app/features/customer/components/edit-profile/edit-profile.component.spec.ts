import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileModalComponent } from './edit-profile.component';

describe('EditProfileComponent', () => {
  let component: EditProfileModalComponent;
  let fixture: ComponentFixture<EditProfileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfileModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
