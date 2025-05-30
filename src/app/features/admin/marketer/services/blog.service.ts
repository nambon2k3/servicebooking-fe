import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class BlogService {
    getTagsByBlogId(id: number) {
      throw new Error('Method not implemented.');
    }
    getAuthorById(authorId: number) {
      throw new Error('Method not implemented.');
    }

    constructor(private http: HttpClient) { }

    getBlogByPage(
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

        return this.http.get(`${environment.apiUrl}marketing/blog/list`, { params });
    }


    updateBlogStatus(id: number, isDeleted: boolean): Observable<any> {
        return this.http.post(`${environment.apiUrl}marketing/blog/change-status/${id}`,  isDeleted);
    }

    getBlogById(id: number): Observable<any> {
        return this.http.get(`${environment.apiUrl}marketing/blog/details/${id}`);
    }

    update(formData: any, id: number): Observable<any> {
        return this.http.put(`${environment.apiUrl}marketing/blog/update/${id}`, formData);
    }

    addBlog(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}marketing/blog/create`, formData);
    }

    getAllTags(): Observable<any> {
        return this.http.get(`${environment.apiUrl}public/tags/all`);
    }

    uploadImage(formData: any): Observable<any> {
        return this.http.post(`${environment.apiUrl}public/upload-file`, formData);
    }
}