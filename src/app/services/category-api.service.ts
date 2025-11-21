import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

interface Category {
  id?: string;
  name: string;
  description?: string;
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  data: {
    items: Category[];
    metadata: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryApiService extends ApiBaseService {
  
  /**
   * Get All Categories
   */
  getAllCategories(params?: {
    page?: number;
    per_page?: number;
  }): Observable<CategoriesResponse> {
    let queryString = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      queryString = `?${queryParams.toString()}`;
    }
    return this.get<CategoriesResponse>(`/categories${queryString}`);
  }

  /**
   * Get Category by ID
   */
  getCategoryById(categoryId: string): Observable<CategoryResponse> {
    return this.get<CategoryResponse>(`/categories/${categoryId}`);
  }

  /**
   * Create Category
   */
  createCategory(category: Category): Observable<CategoryResponse> {
    return this.post<CategoryResponse>('/categories', category);
  }

  /**
   * Update Category
   */
  updateCategory(categoryId: string, category: Partial<Category>): Observable<CategoryResponse> {
    return this.put<CategoryResponse>(`/categories/${categoryId}`, category);
  }

  /**
   * Delete Category
   */
  deleteCategory(categoryId: string): Observable<any> {
    return this.delete<any>(`/categories/${categoryId}`);
  }
}