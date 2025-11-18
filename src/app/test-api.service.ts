import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TestApiService {
  constructor(private http: HttpClient) {}

  getServerStatus(): Observable<any> {
    return this.http.get('http://localhost:5000/api/auth/test');
  }
}
