import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class ServiceCategoryService {
    constructor(private http: HttpClient) { }

    getServiceCategoryByPage(
        page: number = 0,
        size: number = 10,
        keyword?: string,
        isDeleted?: boolean,
        sortField: string = 'createdAt',
        sortDirection: string = 'desc'
    ): Observable<any> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sortField', sortField)
            .set('sortDirection', sortDirection);

        if (keyword) {
            params = params.set('keyword', keyword);
        }
        if (isDeleted !== undefined) {
            params = params.set('isDeleted', isDeleted);
        }

        return this.http.get(`${environment.apiUrl}admin/service-categories/list`, { params });
    }

    getServiceCategoryById(id: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}admin/service-categories/${id}`);
    }

    createServiceCategory(data: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}admin/service-categories/create`, data);
    }

    updateServiceCategory(id: string, data: any): Observable<any> {
        return this.http.put(`${environment.apiUrl}admin/service-categories/update/${id}`, data);
    }

    deleteServiceCategory(id: string, isDeleted = true): Observable<any> {
        return this.http.post(`${environment.apiUrl}admin/service-categories/change-status/${id}?isDeleted=${isDeleted}`, {});
    }

    recoverServiceCategory(id: string, isDeleted = false): Observable<any> {
        return this.http.post(`${environment.apiUrl}admin/service-categories/change-status/${id}?isDeleted=${isDeleted}`, {});
    }
}