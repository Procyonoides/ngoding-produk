import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { TestApiService } from '../../test-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private testApi: TestApiService
  ) {}

  onLogin() {
    // ✅ Validasi input
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Username dan password wajib diisi!';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log('✅ Login response received:', res);

        // ✅ PENTING: Cek response structure
        const role = res?.role;
        const name = res?.name;
        
        console.log('📍 Role from response:', role);
        console.log('📍 Name from response:', name);

        this.isLoading = false;

        // ✅ Redirect berdasarkan role
        if (role === 'admin') {
          console.log('🎯 Redirecting to admin dashboard');
          this.router.navigate(['/admin/admin-dashboard']);
        } else if (role === 'user') {
          console.log('🎯 Redirecting to user view');
          this.router.navigate(['/user/user-view']);
        } else {
          console.warn('⚠️ Unknown role:', role);
          this.errorMessage = 'Role tidak dikenali. Hubungi administrator.';
        }
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Username atau password salah!';
      }
    });

    // ✅ Test API (optional, bisa dihapus)
    this.testApi.getServerStatus().subscribe({
      next: res => console.log('✅ Server test response:', res),
      error: err => console.error('❌ Server test error:', err)
    });
  }
}