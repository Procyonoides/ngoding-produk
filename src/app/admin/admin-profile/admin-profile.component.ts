import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit {
  profile = {
    name: '',
    username: '',
    email: '',
    phone: '',
    imageUrl: ''
  };

  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

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
    // ✅ Load dari auth service
    const name = this.authService.getName();
    const username = this.authService.getUsername();
    
    console.log('📝 Loading profile - Name:', name, 'Username:', username);
    
    this.profile.name = (name && name.trim()) ? name : 'Admin User';
    this.profile.username = username || 'admin';
    this.profile.email = 'admin@furniture.com';
    this.profile.phone = '+62812345678';
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadProfile();
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProfile(): void {
    // ✅ Validasi
    if (!this.profile.name || !this.profile.username || !this.profile.email || !this.profile.phone) {
      this.errorMessage = 'Semua field wajib diisi!';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profile.email)) {
      this.errorMessage = 'Format email tidak valid!';
      return;
    }

    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(this.profile.phone)) {
      this.errorMessage = 'Format nomor telepon tidak valid!';
      return;
    }

    this.loadingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.errorMessage = 'User ID tidak ditemukan!';
      this.loadingProfile = false;
      return;
    }

    const payload = {
      name: this.profile.name.trim(),
      username: this.profile.username.trim(),
      email: this.profile.email.trim().toLowerCase(),
      phone: this.profile.phone.trim()
    };

    this.http.put(`http://localhost:5000/api/auth/users/${userId}`, payload).subscribe({
      next: (res: any) => {
        console.log('✅ Profile updated:', res);
        
        // ✅ Update auth service dengan nama baru
        this.authService.updateUserName(this.profile.name);

        this.successMessage = '✅ Profile berhasil diupdate!';
        this.loadingProfile = false;
        this.isEditing = false;

        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
      },
      error: (err) => {
        console.error('❌ Update profile error:', err);
        this.loadingProfile = false;
        this.errorMessage = err.error?.message || 'Gagal update profile!';

        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  changePassword(): void {
    if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
      this.errorMessage = 'Semua field wajib diisi!';
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'Password tidak cocok!';
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      this.errorMessage = 'Password minimal 8 karakter!';
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
        console.log('✅ Password changed:', res);
        
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
        this.errorMessage = err.error?.message || 'Gagal mengubah password!';
      }
    });
  }

  getPasswordStrength(): number {
    const password = this.passwordForm.newPassword;
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 10;
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