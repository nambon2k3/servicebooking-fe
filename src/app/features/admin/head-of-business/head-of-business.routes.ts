import { Route } from "@angular/router";
import { LayoutComponent } from "../layout/layout.component";
import { ListLocationComponent } from "./components/list-location/list-location.component";
import { PostLocationDetailComponent } from "./components/post-location-detail/post-location-detail.component";
import { TourDayComponent } from "./components/tour-details/tour-day/tour-day.component";
import { TourDetailsLayoutComponent } from "./components/tour-details/tour-details-layout/tour-details-layout.component";
import { TourDetailsComponent } from "./components/tour-details/tour-details.component";
import { ViewListTourComponent } from "./components/view-list-tour/view-list-tour.component";
import { OpenTourForSaleComponent } from "./components/open-tour-for-sale/open-tour-for-sale.component";
import { TourDiscountComponent } from "./components/tour-discount/tour-discount.component";
import { TourListBookingComponent } from "./components/open-tour-for-sale/tour-list-booking/tour-list-booking.component";
import { TourRequestComponent } from "./components/tour-request/tour-request.component";
import { RequestDetailComponent } from "./components/tour-request/request-detail/request-detail.component";

export const HEAD_OF_BUSINESS_ROUTES: Route[] = [
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
        path: 'tour-request',
        component: TourRequestComponent,
      },
      {
        path: 'tour-request-detail',
        component: RequestDetailComponent,
      },
      {
        path: 'locations',
        component: ListLocationComponent,
      },
      {
        path: 'location-details',
        component: PostLocationDetailComponent,
      },
      {
        path: 'list-tour',
        component: ViewListTourComponent,
      },
      {
        path: 'tour-discount',
        component: TourDiscountComponent,
      },
      {
        path: '',
        component: TourDetailsLayoutComponent,
        children: [
          { path: '', redirectTo: 'tour-details', pathMatch: 'full' },
          { path: 'tour-details', component: TourDetailsComponent },
          { path: 'tour-day', component: TourDayComponent },
        ],
      },
      {
        path: 'tour-list-booking/:tourId',
        component: TourListBookingComponent
      },
    ]
  },
  {
    path: 'open-sale-tour',
    component: OpenTourForSaleComponent
  },
];