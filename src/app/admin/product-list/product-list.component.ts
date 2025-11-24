import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

declare var bootstrap: any;

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
  selected?: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  username = '';
  role = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filter & Sort
  searchQuery = '';
  selectedCategory = 'Semua Kategori';
  selectedStatus = 'Semua Status';
  sortBy = 'name';
  sortOrder = 'asc';
  
  categories: string[] = ['Semua Kategori'];
  statuses = ['Semua Status', 'Aktif', 'Menipis', 'Nonaktif'];
  units = ['Unit', 'Set', 'Pcs'];
  
  // Forms
  productForm: Product = this.getEmptyProduct();
  selectedProduct: Product | null = null;
  stockUpdateForm = {
    stock: 0,
    operation: 'Penambahan'
  };

  // Loading & Error
  loading = false;
  errorMessage = '';
  successMessage = '';
  openDropdownId: string | null = null;
  selectedForDelete: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.role = this.authService.getRole() || '';
    this.loadProducts();
    this.loadCategories();
  }

  // ✅ Toggle checkbox untuk delete permanen
  toggleSelectForDelete(productId: string): void {
    const index = this.selectedForDelete.indexOf(productId);
    if (index > -1) {
      this.selectedForDelete.splice(index, 1);
    } else {
      this.selectedForDelete.push(productId);
    }
  }

  // ✅ Check if product is selected
  isProductSelected(productId: string | undefined): boolean {
    return productId ? this.selectedForDelete.includes(productId) : false;
  }

  // ✅ Select/Deselect all
  toggleSelectAll(): void {
    if (this.selectedForDelete.length === this.filteredProducts.length) {
      // Deselect all
      this.selectedForDelete = [];
    } else {
      // Select all
      this.selectedForDelete = this.filteredProducts.map(p => p._id!).filter(id => id);
    }
  }

  // ✅ Delete selected products permanently
  deleteSelectedPermanently(): void {
    if (this.selectedForDelete.length === 0) {
      alert('Pilih minimal 1 produk untuk dihapus');
      return;
    }

    const confirmDelete = confirm(
      `Yakin ingin menghapus ${this.selectedForDelete.length} produk secara PERMANEN? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmDelete) return;

    this.loading = true;

    // Delete semua produk yang dipilih
    const deletePromises = this.selectedForDelete.map(productId =>
      this.http.delete(`http://localhost:5000/api/products/${productId}/hard`).toPromise()
    );

    Promise.all(deletePromises)
      .then(() => {
        this.successMessage = `${this.selectedForDelete.length} produk berhasil dihapus permanen!`;
        
        // ✅ Remove dari list tanpa reload
        this.products = this.products.filter(p => !this.selectedForDelete.includes(p._id!));
        this.applyFilters();
        
        // Clear selection
        this.selectedForDelete = [];
        this.loading = false;

        // Close modal
        const modal = document.getElementById('deletePermanentModal');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
        }
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(el => el.remove());

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      })
      .catch((err) => {
        console.error('❌ Error deleting products:', err);
        this.errorMessage = 'Gagal menghapus produk';
        this.loading = false;
      });
  }

  // ✅ Open delete permanent modal
  openDeletePermanentModal(): void {
    this.selectedForDelete = [];
    this.errorMessage = '';
    const modal = new bootstrap.Modal(document.getElementById('deletePermanentModal'));
    modal.show();
  }

  // ✅ Tambahkan method dropdown
  toggleDropdown(productId: string): void {
    if (this.openDropdownId === productId) {
      this.openDropdownId = null;
    } else {
      this.openDropdownId = productId;
    }
  }

  closeDropdown(): void {
    this.openDropdownId = null;
  }

  getEmptyProduct(): Product {
    return {
      name: '',
      category: 'Meja',
      description: '',
      price: 0,
      stock: 0,
      unit: 'Unit',
      status: 'Aktif',
      imageUrl: ''
    };
  }

  // ✅ LOAD PRODUCTS
  loadProducts(): void {
    this.loading = true;
    this.http.get<Product[]>('http://localhost:5000/api/products').subscribe({
      next: (res) => {
        this.products = res;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading products:', err);
        this.errorMessage = 'Gagal memuat produk';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.http.get<any[]>('http://localhost:5000/api/categories').subscribe({
      next: (res) => {
        this.categories = ['Semua Kategori', ...res.map(c => c.name)];
      }
    });
  }

  // ✅ FILTER & SORT
  applyFilters(): void {
    let filtered = [...this.products];
    
    // Search
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    
    // Category
    if (this.selectedCategory !== 'Semua Kategori') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }
    
    // Status
    if (this.selectedStatus !== 'Semua Status') {
      filtered = filtered.filter(p => p.status === this.selectedStatus);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[this.sortBy as keyof Product];
      let bVal: any = b[this.sortBy as keyof Product];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (this.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    this.filteredProducts = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // ✅ CREATE PRODUCT
  openAddModal(): void {
    this.productForm = this.getEmptyProduct();
    this.errorMessage = '';
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
  }

  addProduct(): void {
    this.loading = true;
    this.errorMessage = '';
    
    this.http.post('http://localhost:5000/api/products', this.productForm).subscribe({
      next: (res: any) => {
        this.successMessage = 'Produk berhasil ditambahkan!';
        this.closeModal('addProductModal');
        this.loadProducts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error adding product:', err);
        this.errorMessage = err.error?.message || 'Gagal menambahkan produk';
        this.loading = false;
      }
    });
  }

  // ✅ VIEW DETAIL
  viewDetail(product: Product): void {
    this.selectedProduct = { ...product };
    const modal = new bootstrap.Modal(document.getElementById('detailProductModal'));
    modal.show();
  }

  // ✅ EDIT PRODUCT
  openEditModal(product: Product): void {
    this.selectedProduct = { ...product };
    this.errorMessage = '';
    this.closeDropdown(); // ✅ Tutup dropdown
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
  }

  updateProduct(): void {
    if (!this.selectedProduct?._id) return;
    
    this.loading = true;
    this.errorMessage = '';
    
    this.http.put(
      `http://localhost:5000/api/products/${this.selectedProduct._id}`,
      this.selectedProduct
    ).subscribe({
      next: (res: any) => {
        this.successMessage = 'Produk berhasil diupdate!';
        this.closeModal('editProductModal');
        this.loadProducts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error updating product:', err);
        this.errorMessage = err.error?.message || 'Gagal mengupdate produk';
        this.loading = false;
      }
    });
  }

  // ✅ UPDATE STOCK
  openStockModal(product: Product): void {
    this.selectedProduct = { ...product };
    this.stockUpdateForm = {
      stock: 0,
      operation: 'Penambahan'
    };
    this.errorMessage = '';
    this.closeDropdown(); // ✅ Tutup dropdown
    const modal = new bootstrap.Modal(document.getElementById('updateStockModal'));
    modal.show();
  }

  updateStock(): void {
    if (!this.selectedProduct?._id) return;
    
    this.loading = true;
    this.errorMessage = '';
    
    const payload = {
      stock: this.stockUpdateForm.stock,
      operation: this.stockUpdateForm.operation === 'Penambahan' ? 'add' : 'set'
    };
    
    this.http.patch(
      `http://localhost:5000/api/products/${this.selectedProduct._id}/stock`,
      payload
    ).subscribe({
      next: (res: any) => {
        this.successMessage = 'Stok berhasil diperbarui!';
        this.closeModal('updateStockModal');
        this.loadProducts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error updating stock:', err);
        this.errorMessage = err.error?.message || 'Gagal memperbarui stok';
        this.loading = false;
      }
    });
  }

  // ✅ DELETE PRODUCT
  openDeleteModal(product: Product): void {
    this.selectedProduct = { ...product };
    this.closeDropdown(); // ✅ Tutup dropdown
    const modal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
    modal.show();
  }

  deleteProduct(): void {
    if (!this.selectedProduct?._id) return;
    
    this.loading = true;
    
    this.http.delete(`http://localhost:5000/api/products/${this.selectedProduct._id}`).subscribe({
      next: (res: any) => {
        this.successMessage = 'Produk berhasil dihapus!';
        this.closeModal('deleteProductModal');
        this.loadProducts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error deleting product:', err);
        this.errorMessage = 'Gagal menghapus produk';
        this.loading = false;
      }
    });
  }

  // ✅ UTILITIES
  getStatusClass(status: string): string {
    switch (status) {
      case 'Menipis': return 'bg-warning-subtle text-warning fw-semibold';
      case 'Aktif': return 'bg-success-subtle text-success fw-semibold';
      case 'Nonaktif': return 'bg-secondary-subtle text-secondary fw-semibold';
      default: return '';
    }
  }

  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    
    // Remove backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
    
    this.loading = false;
    this.errorMessage = '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
