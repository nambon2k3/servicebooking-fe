import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UserStorageService } from '../services/user-storage/user-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  if (req.url.includes('/confirm-email') || req.url.includes('generativelanguage')) {
    return next(req);
  }

  const token = inject(UserStorageService).getToken();

  const clonedRequest = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
    : req;

  return next(clonedRequest).pipe(
    catchError((error) => {
      let errorMessage = 'An unexpected error occurred. Please try again later.';

      if (error.error && typeof error.error === 'object') {
        errorMessage = error.error.data || error.error.message || errorMessage;
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      }

      if (error.status === 401) {
        UserStorageService.signOut(inject(UserStorageService));
        router.navigate(['/login']);
      } else if (error.status === 403) {
        console.error('Access denied:', errorMessage);
      }else if (error.status === 404) {
        console.error('Not Found:', errorMessage);
      } else if (error.status === 500) {
        console.error('Server error:', errorMessage);
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};