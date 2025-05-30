import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileManagementComponent } from './user-profile-management.component';

describe('UserProfileManagementComponent', () => {
  let component: UserProfileManagementComponent;
  let fixture: ComponentFixture<UserProfileManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
