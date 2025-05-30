import { Route } from "@angular/router";
import { ViewListRequestComponent } from "./components/view-list-request/view-list-request.component";
import { ViewRequestDetailComponent } from "./components/view-request-detail/view-request-detail.component";
import { ViewListTourComponent } from "./components/view-list-tour/view-list-tour.component";
import { LayoutComponent } from "../layout/layout.component";
import { ViewListTourPrivateComponent } from "./components/view-list-tour-private/view-list-tour-private.component";

export const OPERATOR_ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'view-list-tour',
        pathMatch: 'full',
      },
      {
        path: 'view-list-request',
        component: ViewListRequestComponent
      },
      {
        path: 'request-details',
        component: ViewRequestDetailComponent
      },
      {
        path: 'view-list-tour',
        component: ViewListTourComponent
      },
      {
        path: 'view-list-tour-private',
        component: ViewListTourPrivateComponent
      },
      {
        path: 'tour-operation',
        loadChildren: () => import('./components/tour-operation/tour-operation.routes').then(m => m.TOUR_OPERATION_ROUTES),
      }
    ]
  },
];