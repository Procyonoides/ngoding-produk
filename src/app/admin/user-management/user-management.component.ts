import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

declare var bootstrap: any;

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NavbarComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {

  users: any[] = [];
  loading = false;
  error = '';
  dtTrigger: Subject<any> = new Subject<any>();
  openDropdownId: string | null = null;
  selectedForDelete: string[] = [];
  successMessage = '';
  errorMessage = '';

  form = {
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    status: '',
    role: ''
  };

  resetForm() {
    this.form = {
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      status: 'false',
      role: ''
    };
  }

  // ✅ EDIT USER - New Properties
  editForm = {
    _id: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    status: '',
    role: '',
    statusToggle: false
  };
  isEditing = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.http.get<any[]>('http://localhost:5000/api/auth/users').subscribe({
      next: (res) => {
        console.log("✅ Data user diterima:", res);
        this.users = res;
      },
      error: (err) => {
        console.error("🔥 Gagal ambil data user:", err);
      }
    });
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // ✅ Dropdown Toggle
  toggleDropdown(userId: string): void {
    this.openDropdownId = this.openDropdownId === userId ? null : userId;
  }

  closeDropdown(): void {
    this.openDropdownId = null;
  }

  // ✅ Edit User
  editUser(user: any): void {
    console.log('Edit user:', user);
    this.closeDropdown();
    
    // Copy data user ke edit form
    this.editForm = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
      statusToggle: user.status === 'aktif' // ✅ Set toggle based on status
    };
    
    this.isEditing = true;
    this.errorMessage = '';
    
    console.log('✅ Edit form loaded:', this.editForm);
    
    // Buka modal edit
    const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
    modal.show();
  }

  // ✅ SAVE EDIT USER - New Method
  saveEditUser(): void {
    // ✅ Validasi input
    if (!this.editForm.name || !this.editForm.username || !this.editForm.email || !this.editForm.phone) {
      this.errorMessage = 'Semua field wajib diisi!';
      return;
    }

    // ✅ Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editForm.email)) {
      this.errorMessage = 'Format email tidak valid!';
      return;
    }

    // ✅ Validasi phone format (Indonesia)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(this.editForm.phone)) {
      this.errorMessage = 'Format nomor telepon tidak valid! (Contoh: 0812345678 atau +6281234567890)';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    console.log("📝 Saving edit form:", this.editForm);

    const payload = {
      name: this.editForm.name.trim(),
      username: this.editForm.username.trim(),
      email: this.editForm.email.trim().toLowerCase(),
      phone: this.editForm.phone.trim(),
      status: this.editForm.status, // ✅ Kirim status langsung
      role: this.editForm.role
    };

    console.log("📤 Payload yang dikirim:", payload);

    this.http.put(`http://localhost:5000/api/auth/users/${this.editForm._id}`, payload).subscribe({
      next: (res: any) => {
        console.log('✅ User berhasil diupdate:', res);
        this.successMessage = 'User berhasil diupdate!';
        this.loading = false;
        
        // Close modal
        const modal = document.getElementById('editUserModal');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
        }
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');

        // Refresh data
        setTimeout(() => {
          this.getUsers();
        }, 500);
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error update user:', err);
        this.loading = false;
        
        let errorMsg = 'Gagal update user!';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 409) {
          errorMsg = 'Username atau email sudah digunakan!';
        }
        
        this.errorMessage = errorMsg;
      }
    });
  }

  // ✅ CANCEL EDIT - New Method
  cancelEditUser(): void {
    this.isEditing = false;
    this.errorMessage = '';
    
    const modal = document.getElementById('editUserModal');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(el => el.remove());
  }

  // ✅ Reset Password
  resetPassword(user: any): void {
    console.log('Reset password untuk:', user.username);
    this.closeDropdown();
    if (confirm(`Apakah Anda yakin ingin reset password untuk ${user.name}?`)) {
      // TODO: Implement reset password logic
      alert('Password direset. User akan menerima password baru via email.');
    }
  }

  // ✅ Delete User (Soft Delete - ubah status jadi nonaktif)
  deleteUser(user: any): void {
    this.closeDropdown();
    if (confirm(`Apakah Anda yakin ingin menonaktifkan user ${user.name}?`)) {
      this.http.delete(`http://localhost:5000/api/auth/users/${user._id}`).subscribe({
        next: (res: any) => {
          console.log('✅ User berhasil dinonaktifkan');
          this.successMessage = 'User berhasil dinonaktifkan';
          this.getUsers();
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err) => {
          console.error('❌ Gagal menonaktifkan user:', err);
          this.errorMessage = 'Gagal menonaktifkan user';
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  addUser() {
    const payload = {
      ...this.form,
      status: this.form.status ? 'aktif' : 'nonaktif'
    };
    this.http.post('http://localhost:5000/api/auth/add-user', payload, { responseType: 'json' }).subscribe({
      next: (res: any) => {
        console.log('✅ Response:', res);
        this.successMessage = res.message || 'User berhasil ditambahkan!';
        this.getUsers();

        // Tutup modal dengan cara aman
        const modalElement = document.getElementById('tambahUserModal');
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modalInstance.hide();
        }

        // Hapus backdrop manual agar tidak menutupi layar
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(el => el.remove());

        // Reset form
        this.resetForm();

        // Clear message
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('🔥 Error tambah user:', err);
        this.errorMessage = err.error?.message || 'Gagal menambahkan user.';
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }


  // ✅ ===== HAPUS PERMANEN - NEW METHODS =====

  // Toggle checkbox untuk delete permanen
  toggleSelectForDelete(userId: string): void {
    const index = this.selectedForDelete.indexOf(userId);
    if (index > -1) {
      this.selectedForDelete.splice(index, 1);
    } else {
      this.selectedForDelete.push(userId);
    }
  }

  // Check if user is selected
  isUserSelected(userId: string | undefined): boolean {
    return userId ? this.selectedForDelete.includes(userId) : false;
  }

  // Select/Deselect all
  toggleSelectAll(): void {
    if (this.selectedForDelete.length === this.users.length) {
      // Deselect all
      this.selectedForDelete = [];
    } else {
      // Select all
      this.selectedForDelete = this.users.map(u => u._id!).filter(id => id);
    }
  }

  // Delete selected users permanently
  deleteSelectedPermanently(): void {
    if (this.selectedForDelete.length === 0) {
      this.errorMessage = 'Pilih minimal 1 user untuk dihapus';
      return;
    }

    const confirmDelete = confirm(
      `Yakin ingin menghapus ${this.selectedForDelete.length} user secara PERMANEN? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmDelete) return;

    this.loading = true;
    this.errorMessage = '';

    // Delete semua user yang dipilih
    const deletePromises = this.selectedForDelete.map(userId =>
      this.http.delete(`http://localhost:5000/api/auth/users/${userId}/hard`).toPromise()
    );

    Promise.all(deletePromises)
      .then(() => {
        this.successMessage = `${this.selectedForDelete.length} user berhasil dihapus permanen!`;
        
        // ✅ Remove dari list tanpa reload
        this.users = this.users.filter(u => !this.selectedForDelete.includes(u._id));
        
        // Clear selection
        this.selectedForDelete = [];
        this.loading = false;

        // Close modal
        const modal = document.getElementById('deletePermanentModal');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          }
        }
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      })
      .catch((err) => {
        console.error('❌ Error deleting users:', err);
        this.errorMessage = 'Gagal menghapus user';
        this.loading = false;
      });
  }

  // Open delete permanent modal
  openDeletePermanentModal(): void {
    this.selectedForDelete = [];
    this.errorMessage = '';
    this.loading = false; // ✅ PENTING: Reset loading state
    const modal = new bootstrap.Modal(document.getElementById('deletePermanentModal'));
    modal.show();
  }
}
