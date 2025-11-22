import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, NavbarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})

export class AdminDashboardComponent implements OnInit {
  username = '';

  // ✅ Statistics Data
  stats = {
    totalProducts: 0,
    totalUsers: 0,
    lowStock: 0
  };

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  // ✅ Load Dashboard Statistics
  loadStatistics(): void {
    // Load Products Statistics
    this.http.get<any[]>('http://localhost:5000/api/products').subscribe({
      next: (products) => {
        this.stats.totalProducts = products.length;
        this.stats.lowStock = products.filter(p => p.status === 'Menipis').length;
      },
      error: (err) => {
        console.error('❌ Error loading products stats:', err);
      }
    });

    // Load Users Statistics
    this.http.get<any[]>('http://localhost:5000/api/auth/users').subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;
      },
      error: (err) => {
        console.error('❌ Error loading users stats:', err);
      }
    });
  }

  goTo(path: string) {
    this.router.navigate([`/admin/${path}`]);
  }

}
