import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

declare var bootstrap: any;

interface Category {
  _id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  productCount: number;
  isActive: boolean;
  createdAt?: Date;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchQuery = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  openDropdownId: string | null = null;

  // Form
  categoryForm: Category = this.getEmptyCategory();
  selectedCategory: Category | null = null;
  isEditMode = false;

  // Icons untuk dropdown
  icons = [
    'bi-box-seam',
    'bi-table',
    'bi-subtract',
    'bi-x-diamond',
    'bi-grid-1x2',
    'bi-boxes',
    'bi-tablet-landscape',
    'bi-palette2'
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  getEmptyCategory(): Category {
    return {
      name: '',
      description: '',
      icon: 'bi-box-seam',
      color: '#ff7b00',
      productCount: 0,
      isActive: true
    };
  }

  // ✅ LOAD CATEGORIES
  loadCategories(): void {
    this.loading = true;
    this.http.get<Category[]>('http://localhost:5000/api/categories').subscribe({
      next: (res) => {
        this.categories = res;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
        this.errorMessage = 'Gagal memuat kategori';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.categories];

    if (this.searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    this.filteredCategories = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  // ✅ OPEN ADD MODAL
  openAddModal(): void {
    this.categoryForm = this.getEmptyCategory();
    this.isEditMode = false;
    this.errorMessage = '';
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
  }

  // ✅ OPEN EDIT MODAL
  openEditModal(category: Category): void {
    this.categoryForm = { ...category };
    this.isEditMode = true;
    this.errorMessage = '';
    this.closeDropdown();
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
  }

  // ✅ SAVE CATEGORY (Add or Edit)
  saveCategory(): void {
    // Validasi
    if (!this.categoryForm.name || this.categoryForm.name.trim() === '') {
      this.errorMessage = 'Nama kategori wajib diisi!';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      name: this.categoryForm.name.trim(),
      description: this.categoryForm.description.trim(),
      icon: this.categoryForm.icon,
      color: this.categoryForm.color,
      isActive: this.categoryForm.isActive
    };

    if (this.isEditMode && this.categoryForm._id) {
      // Update
      this.http.put(
        `http://localhost:5000/api/categories/${this.categoryForm._id}`,
        payload
      ).subscribe({
        next: (res: any) => {
          this.successMessage = 'Kategori berhasil diupdate!';
          this.closeModal('categoryModal');
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Gagal update kategori';
        }
      });
    } else {
      // Create
      this.http.post('http://localhost:5000/api/categories', payload).subscribe({
        next: (res: any) => {
          this.successMessage = 'Kategori berhasil ditambahkan!';
          this.closeModal('categoryModal');
          this.loadCategories();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Gagal menambah kategori';
        }
      });
    }
  }

  // ✅ DELETE CATEGORY
  openDeleteModal(category: Category): void {
    this.selectedCategory = category;
    this.closeDropdown();
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }

  deleteCategory(): void {
    if (!this.selectedCategory?._id) return;

    this.loading = true;
    this.http.delete(`http://localhost:5000/api/categories/${this.selectedCategory._id}`).subscribe({
      next: (res: any) => {
        this.successMessage = 'Kategori berhasil dihapus!';
        this.closeModal('deleteModal');
        this.loadCategories();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Gagal menghapus kategori';
      }
    });
  }

  // ✅ DROPDOWN
  toggleDropdown(categoryId: string): void {
    this.openDropdownId = this.openDropdownId === categoryId ? null : categoryId;
  }

  closeDropdown(): void {
    this.openDropdownId = null;
  }

  // ✅ UTILITIES
  closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');

    this.loading = false;
    this.errorMessage = '';
  }

}
