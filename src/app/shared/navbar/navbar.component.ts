import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() isAdmin: boolean = false;
  @Input() transparent: boolean = false;
  
  username = '';
  name = '';
  role = '';
  showDropdown = false;
  showMobileMenu = false;

  // ✅ Subscriptions
  private userNameSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ PERBAIKAN: Load data dari auth service dengan benar
    this.loadUserData();
    
    // ✅ Subscribe ke real-time updates
    this.userNameSubscription = this.authService.getUserName$().subscribe(
      (newName: string) => {
        console.log('🔄 Navbar received name update:', newName);
        this.name = newName || 'User';
      }
    );
  }

  // ✅ Load user data dengan fallback yang aman
  private loadUserData(): void {
    const name = this.authService.getName();
    const username = this.authService.getUsername();
    const role = this.authService.getRole();
    
    console.log('👤 Loading user data:', { name, username, role });
    
    // ✅ Set name - prioritas: stored name > username > fallback
    this.name = (name && name.trim()) ? name : (username && username.trim()) ? username : 'User';
    
    // ✅ Set username
    this.username = username || '';
    
    // ✅ Set role
    this.role = role || '';
    
    console.log('✅ User data loaded - Name:', this.name, '| Role:', this.role);
  }

  // ✅ Cleanup subscription
  ngOnDestroy(): void {
    if (this.userNameSubscription) {
      this.userNameSubscription.unsubscribe();
      console.log('🧹 Navbar: userName$ subscription cleaned up');
    }
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

  goToProfile(): void {
    this.closeDropdown();
    if (this.isAdmin) {
      this.router.navigate(['/admin/profile']);
    } else {
      this.router.navigate(['/user/profile']);
    }
  }

  goToSettings(): void {
    this.closeDropdown();
    if (this.isAdmin) {
      this.router.navigate(['/admin/settings']);
    } else {
      this.router.navigate(['/user/settings']);
    }
  }

  logout(): void {
    this.closeDropdown();
    if (confirm('Apakah Anda yakin ingin logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}