import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private userProfileSubject = new BehaviorSubject<any>(null);
  userProfile$ = this.userProfileSubject.asObservable();

  // Set the user profile data
  setUserProfile(profileData: any): void {
    this.userProfileSubject.next(profileData);
  }

  // Update the user's avatar URL
  setUserAvatar(avatarUrl: string): void {
    const currentProfile = this.userProfileSubject.value;
    if (currentProfile) {
      const updatedProfile = { ...currentProfile, avatarImg: avatarUrl };
      this.userProfileSubject.next(updatedProfile);
    }
  }
}