import { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ViewListServiceProviderComponent } from "./view-list-service-provider/view-list-service-provider.component";
import { LayoutComponent } from "../layout/layout.component";
import { AddServiceProviderComponent } from "./view-list-service-provider/add-service-provider/add-service-provider.component";
import { UpdateServiceProviderComponent } from "./view-list-service-provider/update-service-provider/update-service-provider.component";
import { TourRequestComponent } from "./tour-request/tour-request.component";
import { TourRequestDetailComponent } from "./tour-request/tour-request-detail/tour-request-detail.component";
import { ServiceComponent } from "./service/service.component";
import { UpdateServiceComponent } from "./service/update-service/update-service.component";

export const CEO_ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      {
        path: 'service-provider',
        component: ViewListServiceProviderComponent
      },
      {
        path: 'service-provider/add',
        component: AddServiceProviderComponent
      },
      {
        path: 'service-provider/:id/edit',
        component: UpdateServiceProviderComponent
      },
      {
        path: 'tour-request',
        component: TourRequestComponent
      },
      {
        path: 'tour-request-detail',
        component: TourRequestDetailComponent
      },
      {
        path: 'service/:id',
        component: ServiceComponent,
      },
      {
        path: 'service/:id/edit',
        component: UpdateServiceComponent
      },
      {
        path: 'service/add/:providerId',
        component: UpdateServiceComponent
      },
    ]
  },
];