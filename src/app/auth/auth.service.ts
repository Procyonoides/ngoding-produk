import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private tokenKey = 'token';
  private roleKey = 'role';
  private usernameKey = 'username';

  constructor(private http: HttpClient, private router: Router) { }

  // ✅ helper untuk cek apakah kita di browser
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (res?.token) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.roleKey, res.role);
          localStorage.setItem(this.usernameKey, res.username ?? username);
          if (res.name) {
            localStorage.setItem('name', res.name);
          }
        }
      })
    );
  }
  
  // login(username: string, password: string): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
  //     tap(res => {
  //       if (res?.token) {
  //         localStorage.setItem('token', res.token);
  //         localStorage.setItem('role', res.role);
  //         localStorage.setItem('username', res.username);
  //       }
  //     })
  //   );
  // }
  
  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.usernameKey);
    }
  }
  
  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.tokenKey) : null;
  }

  getRole(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.roleKey) : null;
  }

  getUsername(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.usernameKey) : null;
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // logout() {
  //   localStorage.clear();
  // }

  // getRole(): string | null {
  //   return localStorage.getItem('role');
  // }

  // isLoggedIn(): boolean {
  //   return !!localStorage.getItem('token');
  // }
  
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

}
