import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './core/auth/register/register.component';
import { ConfirmEmailComponent } from './core/pages/confirm-email/confirm-email.component';
import { ResetPasswordComponent } from './features/common/components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './features/common/components/forgot-password/forgot-password.component';
import { RegistrationConfirmationComponent } from './core/pages/registration-confirmation/registration-confirmation.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'homepage',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'confirm-email',
    component: ConfirmEmailComponent
  },
  {
    path: 'regis-confirm',
    component: RegistrationConfirmationComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/customer.routes').then(m => m.CUSTOMER_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['CUSTOMER'] }
  },
  {
    path: 'ceo',
    loadChildren: () => import('./features/admin/ceo/ceo.routes').then(m => m.CEO_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['CEO'] }
  },
  {
    path: 'marketer',
    loadChildren: () => import('./features/admin/marketer/marketer.routes').then(m => m.MARKETER_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['MARKETER'] }
  },
  {
    path: 'service-provider',
    loadChildren: () => import('./features/service-provider/service-provider.routes').then(m => m.SERVICE_PROVIDER_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['SERVICE_PROVIDER'] }
  },
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES),
  },
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./features/admin/system-admin/system-admin.routes').then(m => m.SYSTEM_ADMIN_ROUTES),
  //   canActivate: [AuthGuard],
  //   data: { expectedRoles: ['ADMIN'] }
  // },
  {
  path: 'admin',
  loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  canActivate: [AuthGuard],
  data: { expectedRoles: ['ADMIN'] }
},
  {
    path: 'head-business',
    loadChildren: () => import('./features/admin/head-of-business/head-of-business.routes').then(m => m.HEAD_OF_BUSINESS_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['HEAD_OF_BUSINESS'] }
  },
  {
    path: 'operator',
    loadChildren: () => import('./features/admin/operator/operator.routes').then(m => m.OPERATOR_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['OPERATOR'] }
  },
  {
    path: 'salesman',
    loadChildren: () => import('./features/admin/salesman/salesman.routes').then(m => m.SALESMAN_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['SALESMAN'] }
  },
  {
    path: 'accountant',
    loadChildren: () => import('./features/admin/accountant/accountant.routes').then(m => m.ACCOUNTANT_ROUTES),
    canActivate: [AuthGuard],
    data: { expectedRoles: ['ACCOUNTANT'] }
  },
  {
    path: 'error',
    loadChildren: () => import('./core/pages/error-page/error-page.routes').then(m => m.ERROR_ROUTES),
  },
];