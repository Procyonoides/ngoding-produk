import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  /**
   * GET request
   */
  protected get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * POST request
   */
  protected post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * PUT request
   */
  protected put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * PATCH request
   */
  protected patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Error Handler
   */
  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'Terjadi kesalahan';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => error);
  }
}