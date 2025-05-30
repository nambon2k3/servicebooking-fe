import { Route } from "@angular/router";
import { LayoutComponent } from "../layout/layout.component";
import { ListReceiptComponent } from "./components/list-receipt/list-receipt.component";
import { ViewListTourComponent } from "./components/view-list-tour/view-list-tour.component";
import { ListRefundComponent } from "./components/list-refund/list-refund.component";
import { ListPaymentComponent } from "./components/list-payment/list-payment.component";
import { PostReceiptComponent } from "./components/post-receipt/post-receipt.component";
import { BookingSettlementComponent } from "./components/booking-settlement/booking-settlement.component";

export const ACCOUNTANT_ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'list-tour',
        pathMatch: 'full',
      },
      {
        path: 'list-tour',
        component: ViewListTourComponent
      },
      {
        path: 'list-receipt',
        component: ListReceiptComponent
      },
      {
        path: 'list-refund',
        component: ListRefundComponent
      },
      {
        path: 'list-payment',
        component: ListPaymentComponent
      },
      {
        path: 'invoice-details',
        component: PostReceiptComponent
      },
      {
        path: 'booking-settlement/:tourScheduleId',
        component: BookingSettlementComponent
      }
    ]
  },
];