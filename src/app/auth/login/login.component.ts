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

  constructor(private authService: AuthService, private router: Router, private testApi: TestApiService) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        // if (res.token) {
        //   // 🔹 arahkan berdasarkan role
        //   if (res.role === 'admin') {
        //     this.router.navigate(['/admin']);
        //   } else {
        //     this.router.navigate(['/user-view']);
        //   }
        // }

        console.log('✅ Login success:', res);

        // Simpan token dan role ke localStorage
        // localStorage.setItem('token', res.token);
        // localStorage.setItem('role', res.role);
        // localStorage.setItem('username', res.username);

        // Redirect berdasarkan role
        if (res.role === 'admin') {
          this.router.navigate(['/admin/admin-dashboard']);
        } else if (res.role === 'user') {
          this.router.navigate(['/user/user-view']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        // console.error('❌ Error login:', err);
        // this.errorMessage = 'Username atau password salah.';
        console.error('❌ Login error:', err);
        this.errorMessage = err.error?.message || 'Login gagal';
      }
    });
    
    this.testApi.getServerStatus().subscribe({
      next: res => console.log('✅ Response:', res),
      error: err => console.error('❌ Error:', err)
    });
  }
}
