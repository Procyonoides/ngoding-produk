import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

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
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  errorMessage = '';
  quantity = 1;
  selectedImage = '';
  username = '';
  name = '';

  // Dummy images for gallery (nanti bisa diganti dengan real data)
  imageGallery: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.name = this.authService.getName() || '';
    
    // Get product ID from route
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProductDetail(productId);
    } else {
      this.errorMessage = 'Product ID tidak ditemukan';
      this.loading = false;
    }
  }

  loadProductDetail(id: string): void {
    this.loading = true;
    this.http.get<Product>(`http://localhost:5000/api/products/${id}`).subscribe({
      next: (res) => {
        this.product = res;
        this.selectedImage = res.imageUrl || 'https://via.placeholder.com/500';
        
        // Create image gallery (dummy for now)
        this.imageGallery = [
          res.imageUrl || 'https://via.placeholder.com/500',
          res.imageUrl || 'https://via.placeholder.com/500',
          res.imageUrl || 'https://via.placeholder.com/500',
          res.imageUrl || 'https://via.placeholder.com/500'
        ];
        
        this.loading = false;
        
        // Load related products (same category)
        this.loadRelatedProducts(res.category);
      },
      error: (err) => {
        console.error('❌ Error loading product:', err);
        this.errorMessage = 'Gagal memuat detail produk';
        this.loading = false;
      }
    });
  }

  loadRelatedProducts(category: string): void {
    this.http.get<Product[]>(`http://localhost:5000/api/products?category=${category}`).subscribe({
      next: (res) => {
        // Exclude current product and limit to 4
        this.relatedProducts = res
          .filter(p => p._id !== this.product?._id)
          .slice(0, 4);
      },
      error: (err) => {
        console.error('❌ Error loading related products:', err);
      }
    });
  }

  selectImage(image: string): void {
    this.selectedImage = image;
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  buyNow(): void {
    if (!this.product) return;
    
    // Implementasi checkout (bisa dibuat nanti)
    alert(`Membeli ${this.quantity} ${this.product.unit} ${this.product.name}\nTotal: Rp ${this.getTotalPrice().toLocaleString()}`);
  }

  getTotalPrice(): number {
    return this.product ? this.product.price * this.quantity : 0;
  }

  isInStock(): boolean {
    return this.product ? this.product.stock > 0 : false;
  }

  getStockStatus(): string {
    if (!this.product) return '';
    
    if (this.product.stock === 0) return 'Habis';
    if (this.product.stock < 5) return 'Stok Terbatas';
    return 'Tersedia';
  }

  getStockClass(): string {
    if (!this.product) return '';
    
    if (this.product.stock === 0) return 'text-danger';
    if (this.product.stock < 5) return 'text-warning';
    return 'text-success';
  }

  goBack(): void {
    this.router.navigate(['/user/user-view']);
  }

  viewProduct(productId: string | undefined): void {
    if (productId) {
      this.router.navigate(['/user/product-detail', productId]);
      // Reload current product
      this.loadProductDetail(productId);
      window.scrollTo(0, 0);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Generate star rating array
  getStarArray(): number[] {
    const rating = this.product?.rating || 0;
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getHalfStar(): boolean {
    const rating = this.product?.rating || 0;
    return rating % 1 >= 0.5;
  }

}
