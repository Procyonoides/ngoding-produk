import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  image_url?: string;
}

interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    items: Product[];
    metadata: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

@Injectable({
  providedIn: 'root'
})
export class ProductApiService extends ApiBaseService {
  
  /**
   * Get All Products (with pagination & filters)
   */
  getAllProducts(params?: {
    page?: number;
    per_page?: number;
    category_id?: string;
    search?: string;
  }): Observable<ProductsResponse> {
    let queryString = '';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.per_page) queryParams.append('per_page', params.per_page.toString());
      if (params.category_id) queryParams.append('category_id', params.category_id);
      if (params.search) queryParams.append('search', params.search);
      queryString = `?${queryParams.toString()}`;
    }
    return this.get<ProductsResponse>(`/products${queryString}`);
  }

  /**
   * Get Product by ID
   */
  getProductById(productId: string): Observable<ProductResponse> {
    return this.get<ProductResponse>(`/products/${productId}`);
  }

  /**
   * Create Product
   */
  createProduct(product: Product): Observable<ProductResponse> {
    return this.post<ProductResponse>('/products', product);
  }

  /**
   * Update Product
   */
  updateProduct(productId: string, product: Partial<Product>): Observable<ProductResponse> {
    return this.put<ProductResponse>(`/products/${productId}`, product);
  }

  /**
   * Delete Product
   */
  deleteProduct(productId: string): Observable<any> {
    return this.delete<any>(`/products/${productId}`);
  }
}