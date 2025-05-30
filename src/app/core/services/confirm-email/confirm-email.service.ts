import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfirmEmailService {

  constructor(private http: HttpClient) {}

  confirmEmail(token: string): Observable<any> {
    return this.http.get(`${environment.apiUrl + 'auth/confirm-email'}?token=${token}`);
  }
}
