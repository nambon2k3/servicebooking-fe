import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {


  constructor(private http: HttpClient) { }

  getWeatherForecastForDay(cityName: string, targetDate: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}public/weather/forecast?location=${cityName}&date=${targetDate}`);
  }
  
}