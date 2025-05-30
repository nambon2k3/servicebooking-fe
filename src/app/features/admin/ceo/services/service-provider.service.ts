import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { catchError } from 'rxjs/operators';
import { LocationService } from "../../head-of-business/services/location/location.service";

@Injectable({
    providedIn: 'root',
})
export class ServiceProvidedService {
    constructor(private http: HttpClient, private locationService: LocationService) { }

    // Lấy danh sách nhà cung cấp theo trang
    getServiceProvidedByPage(
        page: number = 0,
        size: number = 10,
        keyword?: string,
        isDeleted?: boolean,
        sortField: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortField', sortField)
            .set('sortDirection', sortDirection);

        if (keyword) {
            params = params.set('keyword', keyword);
        }
        if (isDeleted !== undefined) {
            params = params.set('isDeleted', isDeleted.toString());
        }

        return this.http.get(`${environment.apiUrl}ceo/service-provider/list`, { params });
    }

    // Lấy danh sách danh mục dịch vụ
    getServiceCategories(
        page: number = 0,
        size: number = 100, 
        keyword?: string,
        isDeleted: boolean = false,
        sortField: string = 'id',
        sortDirection: string = 'asc'
    ): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sortField', sortField)
            .set('sortDirection', sortDirection)
            .set('isDeleted', isDeleted.toString());

        if (keyword) {
            params = params.set('keyword', keyword);
        }

        return this.http.get(`${environment.apiUrl}admin/service-categories/list`, { params });
    }

    // Cập nhật trạng thái nhà cung cấp (xóa/khôi phục)
    updateServiceProvidedStatus(id: number, isDeleted: boolean): Observable<any> {
        let params = new HttpParams().set('isDeleted', isDeleted.toString());
        return this.http.delete(`${environment.apiUrl}ceo/service-provider/change-status/${id}`, { params });
    }

    // Lấy thông tin nhà cung cấp theo ID
    getServiceProviderById(id: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}ceo/service-provider/details/${id}`);
    }

    // Cập nhật nhà cung cấp
    update(formData: any, id: number): Observable<any> {
        return this.http.put(`${environment.apiUrl}ceo/service-provider/update/${id}`, formData);
    }

    // Tạo mới nhà cung cấp
    createServiceProvider(serviceProviderDTO: any): Observable<any> {
        console.log('Data sent to create:', serviceProviderDTO); 
        return this.http.post(`${environment.apiUrl}ceo/service-provider/create`, serviceProviderDTO);
    }

    // Tải lên hình ảnh
    uploadImage(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}public/upload-file`, formData);
    }

    // Lấy danh sách location từ endpoint mới
    getLocations(): Observable<any> {
        return this.http.get(`${environment.apiUrl}ceo/service-provider/location/list-location`).pipe(
            catchError((err) => {
                return of({ code: 500, message: err.message || 'Lỗi khi tải danh sách địa điểm.' });
            })
        );
    }
}