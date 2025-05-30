import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistUpdateSource = new Subject<void>();
  wishlistUpdate$ = this.wishlistUpdateSource.asObservable();

  triggerWishlistUpdate() {
    this.wishlistUpdateSource.next();
  }
}