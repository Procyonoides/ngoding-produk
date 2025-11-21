import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
// ✅ Import API Service baru
import { AuthApiService } from '../services/auth-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ❌ Comment API lama
  // private apiUrl = 'http://localhost:5000/api/auth';
  
  private tokenKey = 'token';
  private roleKey = 'role';
  private usernameKey = 'username';
  private nameKey = 'name';
  private userIdKey = 'userId'; // ✅ Tambahan untuk user ID

  constructor(
    private http: HttpClient, 
    private router: Router,
    private authApiService: AuthApiService // ✅ Inject API Service baru
  ) { }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // ✅ Login dengan API Baru
  login(username: string, password: string): Observable<any> {
    return this.authApiService.login({ username, password }).pipe(
      tap(res => {
        if (res?.success && res?.data?.token && this.isBrowser()) {
          // ✅ Simpan data dari API response
          localStorage.setItem(this.tokenKey, res.data.token);
          localStorage.setItem(this.usernameKey, res.data.user.username);
          localStorage.setItem(this.nameKey, res.data.user.full_name);
          localStorage.setItem(this.roleKey, res.data.user.role.name); // 'admin' atau 'user'
          localStorage.setItem(this.userIdKey, res.data.user.id);
        }
      })
    );
  }

  // ❌ Login Lama (Comment)
  /*
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (res?.token && this.isBrowser()) {
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
  */

  logout(): void {
    if (this.isBrowser()) {
      // ✅ Optional: Call API logout
      this.authApiService.logout().subscribe({
        next: () => {
          console.log('✅ Logout successful');
        },
        error: (err) => {
          console.error('❌ Logout error:', err);
        }
      });

      // ✅ Clear localStorage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.usernameKey);
      localStorage.removeItem(this.nameKey);
      localStorage.removeItem(this.userIdKey);
      
      this.router.navigate(['/login']);
    }
  }
  
  // ✅ Getters
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
    return this.isBrowser() ? localStorage.getItem(this.nameKey) : null;
  }

  getUserId(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.userIdKey) : null;
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        
        if (Date.now() >= expiry) {
          this.logout();
          return false;
        }
        
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }
    
    return false;
  }
  
  // ❌ getAllUsers Lama (Comment, pindah ke UserApiService)
  /*
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
  */
}