import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role_id: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      full_name: string;
      role: {
        id: string;
        name: string;
      };
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService extends ApiBaseService {
  
  /**
   * Login
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', credentials);
  }

  /**
   * Register
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', userData);
  }

  /**
   * Logout
   */
  logout(): Observable<any> {
    return this.post<any>('/auth/logout', {});
  }

  /**
   * Get Current User
   */
  getCurrentUser(): Observable<any> {
    return this.get<any>('/auth/me');
  }
}