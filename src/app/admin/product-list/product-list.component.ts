import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  username = '';
  role = '';

  products = [
    { name: 'Meja Makan Kayu Jati', category: 'Meja', stock: 2, price: 3400000, status: 'Menipis', img: 'https://via.placeholder.com/50' },
    { name: 'Tempat Tidur Queen Size', category: 'Tempat Tidur', stock: 4, price: 6700000, status: 'Menipis', img: 'https://via.placeholder.com/50' },
    { name: 'Lemari Baju', category: 'Lemari', stock: 8, price: 600000, status: 'Aktif', img: 'https://via.placeholder.com/50' },
    { name: 'Kursi Ergonomis', category: 'Kursi', stock: 20, price: 300000, status: 'Aktif', img: 'https://via.placeholder.com/50' },
    { name: 'Lemari Pakaian 3 Pintu', category: 'Lemari', stock: 15, price: 750000, status: 'Aktif', img: 'https://via.placeholder.com/50' },
    { name: 'Rak Buku Minimalis', category: 'Rak', stock: 29, price: 800000, status: 'Aktif', img: 'https://via.placeholder.com/50' },
    { name: 'Meja Belajar Anak', category: 'Meja', stock: 12, price: 1150000, status: 'Aktif', img: 'https://via.placeholder.com/50' },
    { name: 'Kursi Cafe Kayu', category: 'Kursi', stock: 16, price: 780000, status: 'Aktif', img: 'https://via.placeholder.com/50' },
    { name: 'Bufet TV Minimalis', category: 'Bufet', stock: 24, price: 2900000, status: 'Nonaktif', img: 'https://via.placeholder.com/50' },
    { name: 'Meja Kerja Industrial', category: 'Meja', stock: 12, price: 2350000, status: 'Nonaktif', img: 'https://via.placeholder.com/50' },
  ];

  getStatusClass(status: string) {
    switch (status) {
      case 'Menipis': return 'bg-warning-subtle text-warning fw-semibold';
      case 'Aktif': return 'bg-success-subtle text-success fw-semibold';
      case 'Nonaktif': return 'bg-secondary-subtle text-secondary fw-semibold';
      default: return '';
    }
  }

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.role = this.authService.getRole() || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
