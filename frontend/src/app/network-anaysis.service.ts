import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from './appconfig';

@Injectable({
  providedIn: 'root'
})
 export class NetworkAnaysisService {

  constructor(private http: HttpClient) {}
 private apiUrl = AppConfig.apiEndpoint;
  getpacketData(): Observable<any> {
    return this.http.get(this.apiUrl+'/packets');
  }
}
