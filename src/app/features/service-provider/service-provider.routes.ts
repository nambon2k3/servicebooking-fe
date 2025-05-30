import { Route } from "@angular/router";
import { LayoutComponent } from "../admin/layout/layout.component";
import { ServiceRequestComponent } from "./components/service-request/service-request.component";
import { RequestDetailComponent } from "./components/service-request/request-detail/request-detail.component";


export const SERVICE_PROVIDER_ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'service-request',
        pathMatch: 'full'
      },
      {
        path: 'service-request',
        component: ServiceRequestComponent,
      },
      {
        path: 'request-detail',
        component: RequestDetailComponent,
      }
      ]
  },
];