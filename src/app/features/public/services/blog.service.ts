import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Blog } from '../../../core/models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  constructor(private http: HttpClient) { }

  getNewestBlog(page: number, size: number): Observable<{ data: { items: Blog[]; total: number } }> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    
    return this.http.get<{ data: { items: Blog[]; total: number } }>(
      `${environment.apiUrl}public/blog/newest`, { params }
    );
  }  

  getBlogById(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}public/blog/details/${id}`);
}

  getFoodBlogs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}public/blog/food-and-drinks`);
  }

  getRandomBlogs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}public/blog/random`);
  }

  getCulturalBlogs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}public/blog/cultural`);
  }

  getAdventureBlogs(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}public/blog/adventure`);
  }
}
 