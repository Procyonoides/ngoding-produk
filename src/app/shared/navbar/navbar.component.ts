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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.name = this.authService.getName() || 'User';
    this.role = this.authService.getRole() || '';
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}