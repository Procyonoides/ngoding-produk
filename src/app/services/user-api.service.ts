import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

interface User {
  id?: string;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role_id: string;
  is_active?: boolean;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    items: User[];
    metadata: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService extends ApiBaseService {
  
  /**
   * Get All Users
   */
  getAllUsers(params?: {
    page?: number;
    per_page?: number;
    role_id?: string;
    search?: string;
  }): Observable<UsersResponse> {
    let queryString = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.role_id) queryParams.append('role_id', params.role_id);
      if (params.search) queryParams.append('search', params.search);
      queryString = `?${queryParams.toString()}`;
    }
    return this.get<UsersResponse>(`/users${queryString}`);
  }

  /**
   * Get User by ID
   */
  getUserById(userId: string): Observable<UserResponse> {
    return this.get<UserResponse>(`/users/${userId}`);
  }

  /**
   * Create User
   */
  createUser(user: User): Observable<UserResponse> {
    return this.post<UserResponse>('/users', user);
  }

  /**
   * Update User
   */
  updateUser(userId: string, user: Partial<User>): Observable<UserResponse> {
    return this.put<UserResponse>(`/users/${userId}`, user);
  }

  /**
   * Delete User
   */
  deleteUser(userId: string): Observable<any> {
    return this.delete<any>(`/users/${userId}`);
  }
}