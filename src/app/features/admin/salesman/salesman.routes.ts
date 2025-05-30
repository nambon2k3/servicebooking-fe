import { Route } from "@angular/router";
import { LayoutComponent } from "../layout/layout.component";
import { ListBookingComponent } from "./components/list-booking/list-booking.component";
import { AddBookingComponent } from "./components/add-booking/add-booking.component";
import { BookingDetailComponent } from "./components/booking-detail/booking-detail.component";
import { TourListBookingComponent } from "./components/tour-list-booking/tour-list-booking.component";
import { ListTourPrivateComponent } from "./components/list-tour-private/list-tour-private.component";
import { ListTourPublicComponent } from "./components/list-tour-public/list-tour-public.component";
import { CreatePublicBookingComponent } from "./components/create-public-booking/create-public-booking.component";
import { TourBookingServiceComponent } from "./components/tour-booking-service/tour-booking-service.component";
import { CreateTourPrivateContentComponent } from "./components/create-tour-private-content/create-tour-private-content.component";
import { TourServiceComponent } from "./components/tour-service/tour-service.component";
import { TourDetailsLayoutComponent } from "./components/tour-details/tour-details-layout/tour-details-layout.component";
import { TourDetailsComponent } from "./components/tour-details/tour-details.component";
import { TourDayComponent } from "./components/tour-details/tour-day/tour-day.component";
import { ListPlanComponent } from "./components/list-plan/list-plan.component";
import { PlanDetailComponent } from "./components/plan-detail/plan-detail.component";

export const SALESMAN_ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'list-tour-private',
        pathMatch: 'full',
      },
      {
        path: 'list-booking',
        component: ListBookingComponent
      },
      {
        path: 'add-booking',
        component: AddBookingComponent
      },
      {
        path: 'list-tour-private',
        component: ListTourPrivateComponent
      },
      {
        path: 'list-tour-public',
        component: ListTourPublicComponent
      },
      {
        path: 'tour-list-booking/:tourId',
        component: TourListBookingComponent
      },
      {
        path: 'tour-list-booking/:tourId/:scheduleId',
        component: TourListBookingComponent
      },
      {
        path: 'create-public-booking/:tourId/:scheduleId',
        component: CreatePublicBookingComponent
      },
      {
        path: 'tour-private-content/:id',
        component: CreateTourPrivateContentComponent
      },
      {
        path: 'tour-private-service/:tourId',
        component: TourServiceComponent
      },
      { path: 'tour-details', component: TourDetailsComponent },
      {
        path: 'list-plan',
        component: ListPlanComponent
      },
      {
        path: 'plan-detail/:id',
        component: PlanDetailComponent
      }
    ]
  },
  {
    path: 'booking-detail/:id',
    component: BookingDetailComponent
  },
  {
    path: 'tour-booking-service/:tourBookingId',
    component: TourBookingServiceComponent
  }
];