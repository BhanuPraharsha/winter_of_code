import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from './appconfig';

@Injectable({
  providedIn: 'root'
})
export class KeyloggerService {
  private apiUrl =  AppConfig.apiEndpoint; // Update with your FastAPI endpoint

  constructor(private http:HttpClient) { }

  getLogs(): Observable<string> {
    return this.http.get(this.apiUrl+'/logs', { responseType: 'text' });
  }
}
