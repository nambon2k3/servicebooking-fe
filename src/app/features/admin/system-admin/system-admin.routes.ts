import { Route } from "@angular/router";
import { LayoutComponent } from "../layout/layout.component";
import { ListStaffComponent } from "./components/list-staff/list-staff.component";
import { PostStaffDetailComponent } from "./components/post-staff-detail/post-staff-detail.component";
import { ListCustomerComponent } from "./components/list-customer/list-customer.component";
import { ServiceCategoryComponent } from "./components/service-category/service-category.component";

export const SYSTEM_ADMIN_ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'user',
        pathMatch: 'full',
      },
      {
        path: 'user',
        component: ListStaffComponent,
      },
      {
        path: 'user-details',
        component: PostStaffDetailComponent,
      },
      {
        path: 'customer',
        component: ListCustomerComponent,
      },
      {
        path: 'service-category',
        component: ServiceCategoryComponent,
      },
    ]
  },
];