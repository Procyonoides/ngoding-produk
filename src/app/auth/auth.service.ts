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
  private nameKey = 'name';

  constructor(private http: HttpClient, private router: Router) { }

  // ✅ helper untuk cek apakah kita di browser
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (res?.token && this.isBrowser()) {
          // ✅ Simpan hanya data yang aman (TIDAK termasuk password)
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.roleKey, res.role);
          localStorage.setItem(this.usernameKey, res.username ?? username);
          
          if (res.name) {
            localStorage.setItem(this.nameKey, res.name);
          }
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.usernameKey);
      localStorage.removeItem(this.nameKey);
      
      // ✅ Redirect ke login
      this.router.navigate(['/login']);
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

  // ✅ Check login status
  isLoggedIn(): boolean {
    const token = this.getToken();
    
    // ✅ Bonus: Cek apakah token expired (opsional)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() >= expiry) {
          // Token expired, logout otomatis
          this.logout();
          return false;
        }
        
        return true;
      } catch (error) {
        // Token invalid
        this.logout();
        return false;
      }
    }
    
    return false;
  }
  
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

}
