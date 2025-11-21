import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
// ❌ Comment test API
// import { TestApiService } from '../../test-api.service';

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

  constructor(
    private authService: AuthService, 
    private router: Router
    // ❌ Comment test API
    // private testApi: TestApiService
  ) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log('✅ Login success:', res);

        // ✅ Response format dari API baru:
        // { success: true, data: { token, user: { role: { name: 'admin' } } } }
        
        const userRole = res?.data?.user?.role?.name || '';

        // Redirect berdasarkan role
        if (userRole === 'admin') {
          this.router.navigate(['/admin/admin-dashboard']);
        } else if (userRole === 'user') {
          this.router.navigate(['/user/user-view']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.errorMessage = err.error?.message || 'Login gagal';
      }
    });
    
    // ❌ Comment test API
    /*
    this.testApi.getServerStatus().subscribe({
      next: res => console.log('✅ Response:', res),
      error: err => console.error('❌ Error:', err)
    });
    */
  }

  // ❌ Login Logic Lama (Comment)
  /*
  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        console.log('✅ Login success:', res);
        
        if (res.role === 'admin') {
          this.router.navigate(['/admin/admin-dashboard']);
        } else if (res.role === 'user') {
          this.router.navigate(['/user/user-view']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('❌ Login error:', err);
        this.errorMessage = err.error?.message || 'Login gagal';
      }
    });
  }
  */
}