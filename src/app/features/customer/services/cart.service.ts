import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserStorageService } from '../../../core/services/user-storage/user-storage.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  constructor(private http: HttpClient, private userStorageService: UserStorageService) { }



  getCarts(userId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/cart/details/${userId}`);
  }

  deleteCartItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}public/cart/delete/${cartItemId}`);
  }


  updateCartItem(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}public/cart/update`, formData);
  }

  submit(formData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}public/service-booking/submit`, formData);
  }

  details(bookingCode: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/service-booking/details/${bookingCode}`);
  }

}
