import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Product {
  _id?: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  status: string;
  imageUrl: string;
  rating?: number;
  sold?: number;
}

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css'
})
export class UserViewComponent {
  name = '';
  username = '';
  role = '';
  searchQuery = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.name = this.authService.getName() || '';
    this.role = this.authService.getRole() || '';
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.http.get<Product[]>('http://localhost:5000/api/products').subscribe({
      next: (res) => {
        // Only show active products for users
        this.products = res.filter(p => p.status === 'Aktif' || p.status === 'Menipis');
        this.filteredProducts = [...this.products];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading products:', err);
        this.errorMessage = 'Gagal memuat produk';
        this.loading = false;
      }
    });
  }

  searchProduct(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  viewProductDetail(productId: string | undefined): void {
    if (productId) {
      this.router.navigate(['/user/product-detail', productId]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
