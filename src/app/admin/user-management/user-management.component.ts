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
  loading = true;
  error = '';
  dtTrigger: Subject<any> = new Subject<any>();
  openDropdownId: string | null = null;

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
    // TODO: Implement edit user logic
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

  // ✅ Delete User
  deleteUser(user: any): void {
    this.closeDropdown();
    if (confirm(`Apakah Anda yakin ingin menghapus user ${user.name}?`)) {
      this.http.delete(`http://localhost:5000/api/auth/users/${user._id}`).subscribe({
        next: (res: any) => {
          console.log('✅ User berhasil dihapus');
          alert('User berhasil dihapus');
          this.getUsers();
        },
        error: (err) => {
          console.error('❌ Gagal menghapus user:', err);
          alert('Gagal menghapus user');
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
        alert(res.message || 'User berhasil ditambahkan!');
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

        // Refresh data user
        setTimeout(() => {
          this.getUsers();
        }, 300);
      },
      error: (err) => {
        console.error('🔥 Error tambah user:', err);
        alert(err.error?.message || 'Gagal menambahkan user.');
      }
    });
  }
}
