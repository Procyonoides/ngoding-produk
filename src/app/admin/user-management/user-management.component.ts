import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {

  users: any[] = [];
  loading = true;
  error = '';
  dtTrigger: Subject<any> = new Subject<any>();

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

  // onStatusChange() {
  //   // Handle status change jika perlu
  //   console.log('Status:', this.isActive ? 'Aktif' : 'Nonaktif');
  // }

  // constructor(private authService: AuthService) {}
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

  // ngAfterViewInit() {
  //   const toggle = document.getElementById('statusToggle') as HTMLInputElement;
  //   const statusLabel = document.getElementById('statusLabel') as HTMLElement;
    
  //   if (toggle) {
  //     toggle.addEventListener('change', function() {
  //       if (this.checked) {
  //         statusLabel.textContent = 'Aktif';
  //       } else {
  //         statusLabel.textContent = 'Nonaktif';
  //       }
  //     });
  //   }
  // }

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
