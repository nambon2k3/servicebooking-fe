import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GeneralResponse, PaginatedData, ServiceProviderBookingServiceDTO, ChangeServiceDetailDTO } from '../../../core/models/service-request.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceRequestService {
  private apiUrl = `${environment.apiUrl}service-provider/services`;

  constructor(private http: HttpClient) {}

  getListServiceRequest(
    page: number,
    size: number,
    keyword?: string,
    status?: string,
    order?: string
  ): Observable<GeneralResponse<PaginatedData<ServiceProviderBookingServiceDTO>>> {
    let url = `${this.apiUrl}/list-service-request?page=${page}&size=${size}&orderDate=${order || 'desc'}`;
    if (keyword) url += `&keyword=${keyword}`;
    if (status) url += `&status=${status}`;
    return this.http.get<GeneralResponse<PaginatedData<ServiceProviderBookingServiceDTO>>>(url);
  }

  getServiceRequestDetail(tourBookingServiceId: number): Observable<GeneralResponse<ChangeServiceDetailDTO>> {
    return this.http.get<GeneralResponse<ChangeServiceDetailDTO>>(`${this.apiUrl}/service-request-detail/${tourBookingServiceId}`);
  }

  approveServiceRequest(tourBookingServiceId: number): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.apiUrl}/approve/${tourBookingServiceId}`, {});
  }

  rejectServiceRequest(tourBookingServiceId: number): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.apiUrl}/reject/${tourBookingServiceId}`, {});
  }
}