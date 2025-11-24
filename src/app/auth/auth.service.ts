import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  
  // ✅ localStorage keys - KONSISTEN
  private tokenKey = 'token';
  private roleKey = 'role';
  private usernameKey = 'username';
  private nameKey = 'name';
  private userIdKey = 'userId';

  // ✅ BehaviorSubject untuk live update
  private userNameSubject = new BehaviorSubject<string>(this.getName() || 'User');
  public userName$ = this.userNameSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (res?.token && this.isBrowser()) {
          console.log('✅ Login response received:', res);
          
          // ✅ PENTING: Simpan data yang benar
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.roleKey, res.role);
          localStorage.setItem(this.usernameKey, res.username ?? username);
          
          // ✅ CRITICAL FIX: Simpan nama user dengan benar
          if (res.name) {
            localStorage.setItem(this.nameKey, res.name);
            console.log('✅ Name saved to localStorage:', res.name);
          }
          
          // ✅ Simpan userId
          if (res.userId || res.id) {
            localStorage.setItem(this.userIdKey, res.userId || res.id);
          }
          
          // ✅ Update observable dengan nama yang benar
          this.userNameSubject.next(res.name || res.username || 'User');
        }
      })
    );
  }

  // ✅ UPDATE USER NAME (dipanggil setelah edit profile)
  updateUserName(newName: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.nameKey, newName);
      // ✅ Update observable untuk live update navbar
      this.userNameSubject.next(newName);
      console.log('✅ User name updated in service:', newName);
    }
  }

  logout(): void {
    if (this.isBrowser()) {
      // ✅ Clear semua data
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.usernameKey);
      localStorage.removeItem(this.nameKey);
      localStorage.removeItem(this.userIdKey);
      
      // ✅ Reset observable
      this.userNameSubject.next('User');
      console.log('✅ Logged out, localStorage cleared');
      
      // ✅ Redirect ke login
      this.router.navigate(['/login']);
    }
  }
  
  // ✅ GETTERS - AMAN & KONSISTEN
  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.tokenKey) : null;
  }

  getRole(): string | null {
    const role = this.isBrowser() ? localStorage.getItem(this.roleKey) : null;
    console.log('📍 getRole() returning:', role); // Debug
    return role;
  }

  getUsername(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.usernameKey) : null;
  }

  // ✅ CRITICAL FIX: getName harus return nama yang disimpan, bukan undefined
  getName(): string | null {
    const name = this.isBrowser() ? localStorage.getItem(this.nameKey) : null;
    console.log('📍 getName() returning:', name); // Debug
    return name;
  }

  getUserId(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.userIdKey) : null;
  }

  // ✅ Get observable untuk subscribe
  getUserName$(): Observable<string> {
    return this.userName$;
  }

  // ✅ Check login status
  isLoggedIn(): boolean {
    const token = this.getToken();
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        
        if (Date.now() >= expiry) {
          console.warn('⚠️ Token expired');
          this.logout();
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('❌ Token validation error:', error);
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