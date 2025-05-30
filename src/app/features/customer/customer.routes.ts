import { Route } from "@angular/router";
import { UserProfileManagementComponent } from "./components/user-profile-management/user-profile-management.component";
import { ListPlanComponent } from "./components/list-plan/list-plan.component";
import { PublicLayoutComponent } from "../public/layout/public-layout/public-layout.component";
import { PlanDetailComponent } from "./components/list-plan/plan-detail/plan-detail.component";

export const CUSTOMER_ROUTES: Route[] = [
  {
    path: 'user-profile',
    component: UserProfileManagementComponent
  },

  {
      path: '',
      component: PublicLayoutComponent,
      children: [
        {
          path: 'list-plan',
          component: ListPlanComponent
        },
        {
          path: 'plan-detail/:id',
          component: PlanDetailComponent
        }
      ]
  }

  
];