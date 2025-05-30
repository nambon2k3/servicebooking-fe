import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class StaffService {
    constructor(private http: HttpClient) { }

    getStaffByPage(
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

        return this.http.get(`${environment.apiUrl}admin/users/staff`, { params });
    }

    getCustomerByPage(
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

        return this.http.get(`${environment.apiUrl}admin/users/customers`, { params });
    }


    getStaffById(id: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}admin/users/${id}`);
    }

    getStaffRoles(): Observable<any> {
        return this.http.get(`${environment.apiUrl}auth/roles`);
    }

    updateStaff(formData: any): Observable<any> {
        return this.http.put(`${environment.apiUrl}admin/users/${formData.id}`, formData);
    }

    createStaff(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}admin/users`, formData);
    }
    deleteStaff(id: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}admin/users/change-status/${id}?isDeleted=true`, {});
    }

    recoverStaff(id: number): Observable<any> {
        return this.http.post(`${environment.apiUrl}admin/users/change-status/${id}?isDeleted=false`, {});
    }
}