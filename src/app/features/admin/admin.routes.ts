import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { LayoutComponent } from './layout/layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: LayoutComponent, // <-- Layout component must have <router-outlet>
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'booking',
        component: AdminComponent
      }
    ]
  }
];