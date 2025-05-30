// src/app/features/service-provider/services/auth-service.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken(); // Chỉ kiểm tra token tồn tại
  }

  // Bỏ getProviderName vì không cần lấy từ token nữa
}