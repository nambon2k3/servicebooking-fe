// src/app/features/service-provider/services/service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedData } from '../../../core/models/api-response.model';
import { ServiceBase, ServiceResponse, TourDayService } from '../../../core/models/service.model';

@Injectable({
    providedIn: 'root'
})
export class ServiceService {
    private baseUrl = `${environment.apiUrl}ceo/services`;

    constructor(private http: HttpClient) {}

    getServices(
        page: number = 0,
        size: number = 10,
        keyword?: string,
        isDeleted?: boolean,
        providerId?: number,
        sortField: string = 'createdAt',
        sortDirection: string = 'desc'
      ): Observable<ApiResponse<PaginatedData<ServiceBase>>> {
        let params = new HttpParams()
          .set('page', page.toString())
          .set('size', size.toString())
          .set('providerId', providerId ? providerId : '')
          .set('sortField', sortField)
          .set('sortDirection', sortDirection);
    
        if (keyword) params = params.set('keyword', keyword);
        if (isDeleted !== undefined) params = params.set('isDeleted', isDeleted.toString());
    
        return this.http.get<ApiResponse<PaginatedData<ServiceBase>>>(`${this.baseUrl}/list`, { params });
      }

    getTourDayServicesByService(
        serviceId: number,
        page: number = 0,
        size: number = 10
    ): Observable<ApiResponse<TourDayService[]>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        return this.http.get<ApiResponse<TourDayService[]>>(`${this.baseUrl}/tour-day-services/${serviceId}`, { params });
    }

    getServiceDetails(serviceId: number): Observable<ApiResponse<any>> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}/details/${serviceId}`);
    }

    createService(serviceData: Partial<ServiceResponse>): Observable<ApiResponse<ServiceResponse>> {
        return this.http.post<ApiResponse<ServiceResponse>>(`${this.baseUrl}/create`, serviceData);
    }

    updateService(serviceId: number, serviceData: Partial<ServiceResponse>): Observable<ApiResponse<ServiceResponse>> {
        return this.http.put<ApiResponse<ServiceResponse>>(`${this.baseUrl}/update/${serviceId}`, serviceData);
    }

    updateServiceStatus(serviceId: number, isDeleted: boolean): Observable<ApiResponse<ServiceResponse>> {
        return this.http.post<ApiResponse<ServiceResponse>>(`${this.baseUrl}/change-status/${serviceId}`, { isDeleted });
    }

    uploadImage(formData: FormData): Observable<ApiResponse<any>> {
        return this.http.post<ApiResponse<any>>(`${environment.apiUrl}public/upload-file`, formData);
    }

    getCategories(): Observable<any> {
        return this.http.get(`${this.baseUrl}/list-categories`);
    }
}