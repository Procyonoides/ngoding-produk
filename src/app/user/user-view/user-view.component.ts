import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.css'
})
export class UserViewComponent {

  name = '';
  username = '';
  role = '';
  searchQuery = '';

  products = [
    {
      name: 'Meja Makan Kayu Jati - Ukuran besar 100m²',
      price: 3400000,
      rating: 4.9,
      sold: 121,
      description: '',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'
    },
    {
      name: 'Sofa Minimalis - 3 Dudukan',
      price: 5000000,
      rating: 4.7,
      sold: 75,
      description: '',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=60'
    },
    {
      name: 'Meja Kopi Kayu Palet - Vintage',
      price: 900000,
      rating: 4.6,
      sold: 50,
      description: '',
      image: 'https://images.unsplash.com/photo-1578898887932-57c54b52e45e?auto=format&fit=crop&w=800&q=60'
    },
    {
      name: 'Kursi Santai Rotan - Desain ergonomis',
      price: 1200000,
      rating: 4.8,
      sold: 89,
      description: '',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'
    },
    {
      name: 'Rak Dinding Modern - Minimalis',
      price: 750000,
      rating: 4.5,
      sold: 30,
      description: '',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'
    },
    {
      name: 'Lemari Pakaian Kayu - 2 Pintu',
      price: 4200000,
      rating: 4.4,
      sold: 64,
      description: '',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=60'
    },
    {
      name: 'Lampu Hias Gantung - Retro',
      price: 1500000,
      rating: 4.4,
      sold: 25,
      description: '',
      image: 'https://images.unsplash.com/photo-1616628182503-ffa3d9cc2cc9?auto=format&fit=crop&w=800&q=60'
    },
    {
      name: 'Kursi Makan Kayu - Set 4',
      price: 2600000,
      rating: 4.8,
      sold: 45,
      description: '',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'
    }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.name = this.authService.getName() || '';
    this.role = this.authService.getRole() || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  searchProduct(): void {
    console.log('Cari:', this.searchQuery);
  }

}
