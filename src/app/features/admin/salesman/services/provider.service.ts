import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class ProviderService {

    constructor(private http: HttpClient) { }

    getProviderByLocationIds(locationId: number, categoryName: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/service-providers/list`, {
            params: {
                locationId: locationId,
                categoryName: categoryName
            }
        });
    }


    getServiceByProviderIds(providerId: number, categoryName: string): Observable<any> {
        return this.http.get(`${environment.apiUrl}salesman/service-providers/service/list`, {
            params: {
                providerId: providerId,
                categoryName: categoryName
            }
        });
    }
    

}