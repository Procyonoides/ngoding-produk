import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface Statistics {
  totalProducts: number;
  activeProducts: number;
  lowStock: number;
  outOfStock: number;
  totalCategories: number;
  activeCategories: number;
  totalUsers: number;
  activeUsers: number;
  adminCount: number;
  userCount: number;
}

interface Category {
  _id?: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  loading = true;
  
  statistics: Statistics = {
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalCategories: 0,
    activeCategories: 0,
    totalUsers: 0,
    activeUsers: 0,
    adminCount: 0,
    userCount: 0
  };

  topCategories: Category[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;

    // Load all data in parallel
    Promise.all([
      this.loadProductStatistics(),
      this.loadCategoryStatistics(),
      this.loadUserStatistics()
    ]).then(() => {
      this.loading = false;
      console.log('✅ All statistics loaded');
    }).catch(err => {
      console.error('❌ Error loading statistics:', err);
      this.loading = false;
    });
  }

  // ✅ Load Product Statistics
  loadProductStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>('http://localhost:5000/api/products').subscribe({
        next: (products) => {
          this.statistics.totalProducts = products.length;
          this.statistics.activeProducts = products.filter(p => p.status === 'Aktif').length;
          this.statistics.lowStock = products.filter(p => p.status === 'Menipis').length;
          this.statistics.outOfStock = products.filter(p => p.status === 'Nonaktif').length;
          resolve();
        },
        error: (err) => {
          console.error('❌ Error loading product stats:', err);
          reject(err);
        }
      });
    });
  }

  // ✅ Load Category Statistics
  loadCategoryStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Category[]>('http://localhost:5000/api/categories').subscribe({
        next: (categories) => {
          this.statistics.totalCategories = categories.length;
          this.statistics.activeCategories = categories.filter(c => c.isActive).length;
          
          // Get top 5 categories by product count
          this.topCategories = categories
            .sort((a, b) => b.productCount - a.productCount)
            .slice(0, 5);
          
          resolve();
        },
        error: (err) => {
          console.error('❌ Error loading category stats:', err);
          reject(err);
        }
      });
    });
  }

  // ✅ Load User Statistics
  loadUserStatistics(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<any[]>('http://localhost:5000/api/auth/users').subscribe({
        next: (users) => {
          this.statistics.totalUsers = users.length;
          this.statistics.activeUsers = users.filter(u => u.status === 'aktif').length;
          this.statistics.adminCount = users.filter(u => u.role === 'admin').length;
          this.statistics.userCount = users.filter(u => u.role === 'user').length;
          resolve();
        },
        error: (err) => {
          console.error('❌ Error loading user stats:', err);
          reject(err);
        }
      });
    });
  }

  // ✅ Calculate Percentage
  getPercentage(value: number): number {
    if (this.statistics.totalProducts === 0) return 0;
    return Math.round((value / this.statistics.totalProducts) * 100);
  }

}
