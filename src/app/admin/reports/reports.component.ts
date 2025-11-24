import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface Product {
  _id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  sold?: number;
}

interface User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
}

interface Category {
  _id?: string;
  name: string;
  productCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  // ✅ Data
  products: Product[] = [];
  users: User[] = [];
  categories: Category[] = [];

  // ✅ State
  loading = true;
  errorMessage = '';
  activeTab = 'overview'; // overview, product, user, category, stock, summary
  
  // ✅ Report Data
  reportData = {
    totalProducts: 0,
    totalUsers: 0,
    totalCategories: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    activeUsers: 0,
    adminCount: 0,
    userCount: 0,
    totalRevenue: 0, // Dummy
    topProducts: [] as any[],
    categoryDistribution: [] as any[],
    userRoleDistribution: { admin: 0, user: 0 },
    userStatusDistribution: { aktif: 0, nonaktif: 0 }
  };

  // ✅ Filters
  selectedCategory = 'Semua';
  selectedStatus = 'Semua';
  selectedRole = 'Semua';

  // ✅ Export formats
  exportFormat = 'pdf'; // pdf, csv, json

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    Promise.all([
      this.loadProducts(),
      this.loadUsers(),
      this.loadCategories()
    ]).then(() => {
      this.generateReports();
      this.loading = false;
      console.log('✅ All data loaded for reports');
    }).catch(err => {
      console.error('❌ Error loading data:', err);
      this.errorMessage = 'Gagal memuat data laporan';
      this.loading = false;
    });
  }

  private loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Product[]>('http://localhost:5000/api/products').subscribe({
        next: (res) => {
          this.products = res;
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  private loadUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<User[]>('http://localhost:5000/api/auth/users').subscribe({
        next: (res) => {
          this.users = res;
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  private loadCategories(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Category[]>('http://localhost:5000/api/categories').subscribe({
        next: (res) => {
          this.categories = res;
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  // ✅ GENERATE REPORTS
  private generateReports(): void {
    console.log('📊 Generating reports...');

    // ✅ Product Statistics
    this.reportData.totalProducts = this.products.length;
    this.reportData.activeProducts = this.products.filter(p => p.status === 'Aktif').length;
    this.reportData.lowStockProducts = this.products.filter(p => p.status === 'Menipis').length;
    this.reportData.outOfStockProducts = this.products.filter(p => p.status === 'Nonaktif').length;

    // ✅ User Statistics
    this.reportData.totalUsers = this.users.length;
    this.reportData.activeUsers = this.users.filter(u => u.status === 'aktif').length;
    this.reportData.adminCount = this.users.filter(u => u.role === 'admin').length;
    this.reportData.userCount = this.users.filter(u => u.role === 'user').length;

    // ✅ Category Statistics
    this.reportData.totalCategories = this.categories.length;

    // ✅ Top Products (berdasarkan sold)
    this.reportData.topProducts = this.products
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        sold: p.sold || 0,
        price: p.price,
        revenue: (p.sold || 0) * p.price,
        stock: p.stock
      }));

    // ✅ Calculate Total Revenue (dari top products)
    this.reportData.totalRevenue = this.reportData.topProducts.reduce((sum, p) => sum + p.revenue, 0);

    // ✅ Category Distribution
    this.reportData.categoryDistribution = this.categories.map(c => ({
      name: c.name,
      productCount: c.productCount,
      percentage: this.reportData.totalProducts > 0 
        ? Math.round((c.productCount / this.reportData.totalProducts) * 100) 
        : 0
    }));

    // ✅ User Role Distribution
    this.reportData.userRoleDistribution.admin = this.reportData.adminCount;
    this.reportData.userRoleDistribution.user = this.reportData.userCount;

    // ✅ User Status Distribution
    this.reportData.userStatusDistribution.aktif = this.reportData.activeUsers;
    this.reportData.userStatusDistribution.nonaktif = this.reportData.totalUsers - this.reportData.activeUsers;

    console.log('✅ Reports generated:', this.reportData);
  }

  // ✅ GET FILTERED DATA
  getFilteredProducts(): Product[] {
    return this.products.filter(p => {
      const categoryMatch = this.selectedCategory === 'Semua' || p.category === this.selectedCategory;
      const statusMatch = this.selectedStatus === 'Semua' || p.status === this.selectedStatus;
      return categoryMatch && statusMatch;
    });
  }

  getFilteredUsers(): User[] {
    return this.users.filter(u => {
      const roleMatch = this.selectedRole === 'Semua' || u.role === this.selectedRole;
      return roleMatch;
    });
  }

  // ✅ TAB NAVIGATION
  switchTab(tab: string): void {
    this.activeTab = tab;
    console.log('📑 Switched to tab:', tab);
  }

  // ✅ EXPORT FUNCTIONS
  exportReport(): void {
    if (this.exportFormat === 'pdf') {
      this.exportToPDF();
    } else if (this.exportFormat === 'csv') {
      this.exportToCSV();
    } else if (this.exportFormat === 'json') {
      this.exportToJSON();
    }
  }

  private exportToPDF(): void {
    // ✅ Implementasi PDF export (bisa menggunakan library seperti jsPDF)
    alert('📄 Export ke PDF - Feature akan dikembangkan menggunakan jsPDF');
    console.log('Exporting to PDF...');
  }

  private exportToCSV(): void {
    let csvContent = 'LAPORAN INVENTARIS FURNITURE\n';
    csvContent += `Tanggal: ${new Date().toLocaleDateString('id-ID')}\n\n`;

    // ✅ Product Report CSV
    csvContent += 'LAPORAN PRODUK\n';
    csvContent += 'Nama,Kategori,Harga,Stok,Status\n';
    this.getFilteredProducts().forEach(p => {
      csvContent += `${p.name},${p.category},${p.price},${p.stock},${p.status}\n`;
    });

    csvContent += '\n\nLAPORAN USER\n';
    csvContent += 'Nama,Username,Email,Role,Status\n';
    this.getFilteredUsers().forEach(u => {
      csvContent += `${u.name},${u.username},${u.email},${u.role},${u.status}\n`;
    });

    // ✅ Download CSV
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `laporan-${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    console.log('✅ CSV exported successfully');
  }

  private exportToJSON(): void {
    const jsonData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalProducts: this.reportData.totalProducts,
        totalUsers: this.reportData.totalUsers,
        totalCategories: this.reportData.totalCategories,
        totalRevenue: this.reportData.totalRevenue
      },
      products: this.getFilteredProducts(),
      users: this.getFilteredUsers(),
      categories: this.categories,
      statistics: this.reportData
    };

    // ✅ Download JSON
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonData, null, 2)));
    element.setAttribute('download', `laporan-${new Date().getTime()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    console.log('✅ JSON exported successfully');
  }

  // ✅ PRINT REPORT
  printReport(): void {
    window.print();
  }

  // ✅ UTILITY
  goBack(): void {
    this.router.navigate(['/admin/admin-dashboard']);
  }

}
