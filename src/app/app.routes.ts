import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './admin/product-list/product-list.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { AdminProfileComponent } from './admin/admin-profile/admin-profile.component';
import { UserViewComponent } from './user/user-view/user-view.component';
import { ProductDetailComponent } from './user/product-detail/product-detail.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { SettingsComponent } from './shared/settings/settings.component';
import { LoginComponent } from './auth/login/login.component';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },

    {
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { role: 'admin' },
        children: [
        { path: 'admin-dashboard', component: AdminDashboardComponent },
        { path: 'product-list', component: ProductListComponent },
        { path: 'user-management', component: UserManagementComponent },
        { path: 'profile', component: AdminProfileComponent },
        { 
          path: 'settings', 
          component: SettingsComponent,
          data: { isAdmin: true }
        },
        { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' }
        ]
    },
    {
        path: 'user',
        canActivate: [authGuard, roleGuard],
        data: { role: 'user' },
        children: [
        { path: 'user-view', component: UserViewComponent },
        { path: 'product-detail/:id', component: ProductDetailComponent },
        { path: 'profile', component: UserProfileComponent },
        { 
          path: 'settings', 
          component: SettingsComponent,
          data: { isAdmin: false }
        },
        { path: '', redirectTo: 'user-view', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: '/login' }
];
