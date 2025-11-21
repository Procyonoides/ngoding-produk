import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Input() isAdmin: boolean = false;
  @Input() transparent: boolean = false;
  
  username = '';
  name = '';
  role = '';
  showDropdown = false;
  showMobileMenu = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.name = this.authService.getName() || 'User';
    this.role = this.authService.getRole() || '';
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  goToDashboard(): void {
    this.closeDropdown();
    if (this.isAdmin) {
      this.router.navigate(['/admin/admin-dashboard']);
    }
  }

  goToProductList(): void {
    this.closeDropdown();
    if (this.isAdmin) {
      this.router.navigate(['/admin/product-list']);
    }
  }

  goToUserManagement(): void {
    this.closeDropdown();
    if (this.isAdmin) {
      this.router.navigate(['/admin/user-management']);
    }
  }

  goToUserView(): void {
    this.closeDropdown();
    if (!this.isAdmin) {
      this.router.navigate(['/user/user-view']);
    }
  }

  goToProfile(): void {
    this.closeDropdown();
    // Navigate to profile page (akan dibuat nanti)
    if (this.isAdmin) {
      this.router.navigate(['/admin/profile']);
    } else {
      this.router.navigate(['/user/profile']);
    }
  }

  goToSettings(): void {
    this.closeDropdown();
    // Navigate to settings page (akan dibuat nanti)
    if (this.isAdmin) {
      this.router.navigate(['/admin/settings']);
    } else {
      this.router.navigate(['/user/settings']);
    }
  }

  logout(): void {
    this.closeDropdown();
    // Confirm logout
    if (confirm('Apakah Anda yakin ingin logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}