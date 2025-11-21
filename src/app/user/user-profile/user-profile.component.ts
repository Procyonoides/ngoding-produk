import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {

  profile = {
    name: '',
    username: '',
    email: '',
    phone: '',
    imageUrl: ''
  };

  // ✅ Password Form
  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // ✅ Show/Hide Password
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  isEditing = false;
  loadingProfile = false;
  loadingPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profile.name = this.authService.getName() || '';
    this.profile.username = this.authService.getUsername() || '';
    // Note: Email dan phone harus diambil dari API
    // Untuk sementara gunakan dummy data
    this.profile.email = 'user@example.com';
    this.profile.phone = '+62812345678';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile(); // Reset jika cancel
    }
    this.errorMessage = '';
  }

  saveProfile(): void {
    this.loadingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';

    // TODO: Implement API call to update profile
    setTimeout(() => {
      this.successMessage = 'Profile berhasil diupdate!';
      this.loadingProfile = false;
      this.isEditing = false;
      
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1000);
  }

  // ✅ Change Password
  changePassword(): void {
    if (!this.passwordForm.oldPassword) {
      this.errorMessage = 'Password lama wajib diisi!';
      return;
    }

    if (!this.passwordForm.newPassword) {
      this.errorMessage = 'Password baru wajib diisi!';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'Password baru dan konfirmasi tidak cocok!';
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.errorMessage = 'Password minimal 8 karakter!';
      return;
    }

    if (this.passwordForm.oldPassword === this.passwordForm.newPassword) {
      this.errorMessage = 'Password baru tidak boleh sama dengan password lama!';
      return;
    }

    this.loadingPassword = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      oldPassword: this.passwordForm.oldPassword,
      newPassword: this.passwordForm.newPassword
    };

    this.http.post('http://localhost:5000/api/auth/change-password', payload).subscribe({
      next: (res: any) => {
        console.log('✅ Change password success:', res);
        
        this.successMessage = 'Password berhasil diubah! Silakan login kembali.';
        this.loadingPassword = false;
        
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Change password error:', err);
        this.loadingPassword = false;
        
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = err.error?.message || 'Password lama tidak sesuai!';
        } else if (err.status === 403) {
          this.errorMessage = 'Anda tidak memiliki akses untuk mengubah password!';
        } else {
          this.errorMessage = 'Gagal mengubah password. Silakan coba lagi.';
        }
      }
    });
  }

  // ✅ Password Strength Checker
  getPasswordStrength(): number {
    const password = this.passwordForm.newPassword;
    if (!password) return 0;

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 15;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 15;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 10;
    
    // Contains special char
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    return strength;
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'bg-danger';
    if (strength < 70) return 'bg-warning';
    return 'bg-success';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Lemah';
    if (strength < 70) return 'Sedang';
    return 'Kuat';
  }

}
