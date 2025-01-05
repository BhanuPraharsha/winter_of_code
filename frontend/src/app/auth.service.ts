import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppConfig } from './appconfig';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
   private apiUrl = AppConfig.apiEndpoint;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const body = {
      username: username,
      password: password,
    };

    return this.http.post(this.apiUrl+'/login', body);
  }
}
