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

  goBack(): void {
    this.router.navigate(['/admin/admin-dashboard']);
  }

  saveProfile(): void {
    // ✅ Validasi input
    if (!this.profile.name || !this.profile.username || !this.profile.email || !this.profile.phone) {
      this.errorMessage = 'Semua field wajib diisi!';
      return;
    }

    // ✅ Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profile.email)) {
      this.errorMessage = 'Format email tidak valid!';
      return;
    }

    // ✅ Validasi nomor telepon (Indonesia)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(this.profile.phone)) {
      this.errorMessage = 'Format nomor telepon tidak valid! (Contoh: 0812345678 atau +6281234567890)';
      return;
    }

    this.loadingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ Get userId dari auth service
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.errorMessage = 'User ID tidak ditemukan!';
      this.loadingProfile = false;
      return;
    }

    console.log("📝 Updating profile:", {
      userId,
      name: this.profile.name,
      username: this.profile.username,
      email: this.profile.email,
      phone: this.profile.phone
    });

    // ✅ Prepare payload (gunakan 'name', backend juga accept 'full_name')
    const payload = {
      name: this.profile.name.trim(),
      username: this.profile.username.trim(),
      email: this.profile.email.trim().toLowerCase(),
      phone: this.profile.phone.trim()
    };

    // ✅ PERBAIKAN: Endpoint yang benar adalah /api/auth/users/:userId
    this.http.put(`http://localhost:5000/api/auth/users/${userId}`, payload).subscribe({
      next: (res: any) => {
        console.log('✅ Update profile response:', res);
        
        // ✅ Update localStorage dengan data baru
        localStorage.setItem('name', this.profile.name);
        localStorage.setItem('username', this.profile.username);

        // ✅ LIVE UPDATE: Notify auth service untuk update navbar
        this.authService.updateUserName(this.profile.name);

        this.successMessage = '✅ Profile berhasil diupdate!';
        this.loadingProfile = false;
        this.isEditing = false;

        // ✅ Auto-hide success message
        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
      },
      error: (err) => {
        console.error('❌ Update profile error:', err);
        this.loadingProfile = false;

        // ✅ Display error message dari backend
        let errorMsg = 'Gagal update profile. Silakan coba lagi.';

        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 400) {
          errorMsg = 'Data tidak valid!';
        } else if (err.status === 403) {
          errorMsg = 'Anda tidak memiliki akses untuk mengubah profile ini!';
        } else if (err.status === 404) {
          errorMsg = 'User tidak ditemukan!';
        } else if (err.status === 409) {
          errorMsg = err.error?.message || 'Username atau email sudah digunakan!';
        } else if (err.status === 500) {
          errorMsg = 'Server error. Silakan coba lagi nanti.';
        }

        this.errorMessage = errorMsg;

        // ✅ Auto-hide error message
        setTimeout(() => {
          if (this.errorMessage === errorMsg) {
            this.errorMessage = '';
          }
        }, 5000);
      }
    });
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

    // ✅ Cek apakah password baru sama dengan password lama
    if (this.passwordForm.oldPassword === this.passwordForm.newPassword) {
      this.errorMessage = 'Password baru tidak boleh sama dengan password lama!';
      return;
    }

    this.loadingPassword = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ✅ Payload untuk API
    const payload = {
      oldPassword: this.passwordForm.oldPassword,
      newPassword: this.passwordForm.newPassword
    };

    // ✅ Call API change password
    this.http.post('http://localhost:5000/api/auth/change-password', payload).subscribe({
      next: (res: any) => {
        console.log('✅ Change password success:', res);
        
        this.successMessage = 'Password berhasil diubah! Silakan login kembali.';
        this.loadingPassword = false;
        
        // ✅ Reset form
        this.passwordForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        };

        // ✅ Redirect to login after 2 seconds
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Change password error:', err);
        this.loadingPassword = false;
        
        // ✅ Handle error dari backend
        if (err.status === 401 || err.status === 400) {
          this.errorMessage = err.error?.message || 'Password lama tidak sesuai!';
        } else if (err.status === 403) {
          this.errorMessage = 'Anda tidak memiliki akses untuk mengubah password!';
        } else {
          this.errorMessage = 'Gagal mengubah password. Silakan coba lagi.';
        }

        // ✅ Jangan reset form jika error, biar user bisa perbaiki
        // ✅ Jangan redirect ke login jika error
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
