import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeneralResponse, PagingDTO, Tour, TourDetail, TourDayDetail, TourStatus } from '../../../../core/models/tour-request.model';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TourRequestService {
  private apiUrl = `${environment.apiUrl}ceo`;

  constructor(private http: HttpClient) {}

  // Lấy danh sách tour cần xử lý
  getAllTourNeedToProcess(
    page: number,
    size: number,
    keyword?: string,
    tourStatus?: TourStatus,
    orderDate: string = 'desc'
  ): Observable<GeneralResponse<PagingDTO<Tour>>> { // Sửa kiểu trả về từ PagingDTO<Tour[]> thành PagingDTO<Tour>
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderDate', orderDate);

    if (keyword) {
      params = params.set('keyword', keyword);
    }
    if (tourStatus) {
      params = params.set('tourStatus', tourStatus);
    }

    return this.http.get<GeneralResponse<PagingDTO<Tour>>>(`${this.apiUrl}/process-tour/list`, { params });
  }

  // Lấy chi tiết tour
  getDetailTourNeedToProcess(tourId: number): Observable<GeneralResponse<TourDetail>> {
    return this.http.get<GeneralResponse<TourDetail>>(`${this.apiUrl}/process-tour/detail/${tourId}`);
  }

  // Lấy chi tiết ngày tour
  getDetailTourDay(tourId: number, tourDayId: number): Observable<GeneralResponse<TourDayDetail>> {
    return this.http.get<GeneralResponse<TourDayDetail>>(`${this.apiUrl}/process-tour/detail/${tourId}/tour-day-detail/${tourDayId}`);
  }

  // Phê duyệt tour
  approveTourProcess(tourId: number): Observable<GeneralResponse<TourDetail>> {
    return this.http.put<GeneralResponse<TourDetail>>(`${this.apiUrl}/process-tour/approve-tour-process/${tourId}`, {});
  }

  // Từ chối tour
  rejectTourProcess(tourId: number): Observable<GeneralResponse<TourDetail>> {
    return this.http.put<GeneralResponse<TourDetail>>(`${this.apiUrl}/process-tour/reject-tour-process/${tourId}`, {});
  }
}