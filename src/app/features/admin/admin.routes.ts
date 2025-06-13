import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminComponent }, // Default /admin
  { path: 'booking', component: AdminComponent } // /admin/booking
];