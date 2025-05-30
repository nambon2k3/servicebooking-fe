import { Route } from "@angular/router";
import { ListBookingComponent } from "./list-booking/list-booking.component";
import { ListCustomerComponent } from "./list-customer/list-customer.component";
import { LogComponent } from "./log/log.component";
import { ServiceComponent } from "./service/service.component";
import { SummaryComponent } from "./summary/summary.component";
import { TourOperationLayoutComponent } from "./tour-operation-layout/tour-operation-layout.component";
import { TourOperationComponent } from "./tour-operation.component";
import { TransactionComponent } from "./transaction/transaction.component";
import { ServiceDetailComponent } from "./service/service-detail/service-detail.component";

export const TOUR_OPERATION_ROUTES: Route[] = [
  {
      path: '',
      component: TourOperationLayoutComponent,
      children: [
        { 
          path: '',
          pathMatch: 'full',
          redirectTo: 'overview'
        },
        { 
          path: 'overview',
          component: TourOperationComponent
        },
        {
          path: 'list-customer',
          component: ListCustomerComponent
        },
        {
          path: 'list-booking',
          component: ListBookingComponent
        },
        {
          path: 'list-service',
          component: ServiceComponent
        },
        {
          path: 'log',
          component: LogComponent
        },
        {
          path: 'transaction',
          component: TransactionComponent
        },
        {
          path: 'summary',
          component: SummaryComponent
        },
      ]
    },
    {
      path: 'service/:id',
      component: ServiceDetailComponent
    },
];
