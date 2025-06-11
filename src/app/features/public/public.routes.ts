import { Route } from "@angular/router";
import { PublicLayoutComponent } from "./layout/public-layout/public-layout.component";
import { HomepageComponent } from "./components/homepage/homepage.component";
import { BlogDetailComponent } from "./components/blog/blog-detail/blog-detail.component";
import { BlogComponent } from "./components/blog/blog.component";
import { HotelComponent } from "./components/hotel/hotel.component";
import { TourComponent } from "./components/tour/tour.component";
import { TourDetailComponent } from "./components/tour/tour-detail/tour-detail.component";
import { TourBookingComponent } from "./components/tour-booking/tour-booking.component";
import { TourBookingConfirmComponent } from "./components/tour-booking/tour-booking-confirm/tour-booking-confirm.component";
import { HotelDetailComponent } from "./components/hotel/hotel-detail/hotel-detail.component";
import { DestinationComponent } from "./components/destination/destination.component";
import { PlanComponent } from "./components/plan/plan.component";
import { PlanDetailComponent } from "./components/plan/plan-detail/plan-detail.component";
import { RestaurantComponent } from "./components/restaurant/restaurant.component";
import { RestaurantDetailComponent } from "./components/restaurant/restaurant-detail/restaurant-detail.component";
import { ActivitiesComponent } from "./components/activity/activity.component";

export const PUBLIC_ROUTES: Route[] = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'homepage',
      },
      {
        path: 'homepage',
        component: HomepageComponent,
      },
      {
        path: 'blog-details/:id',
        component: BlogDetailComponent,
      },
      {
        path: 'blogs',
        component: BlogComponent,
      },
      {
        path: 'hotels',
        component: HotelComponent,
      },
      {
        path: 'activities',
        component: ActivitiesComponent,
      },
      {
        path: 'hotel-details/:id',
        component: HotelDetailComponent,
      },
      {
        path: 'restaurants',
        component: RestaurantComponent,
      },
      {
        path: 'restaurant-details/:id',
        component: RestaurantDetailComponent,
      },
      {
        path: 'tours',
        component: TourComponent,
      },
      {
        path: 'tour-details/:id',
        component: TourDetailComponent,
      },
      {
        path: 'tour-booking/:tourId/:scheduleId',
        component: TourBookingComponent,
      }
      ,{
        path: 'tour-booking-detail/:code',
        component: TourBookingConfirmComponent,
      },
      {
        path: 'plan',
        component: PlanComponent,
      },
      {
        path: 'location-details/:id',
        component: DestinationComponent,
      },
      {
        path: 'plan-detail/:id',
        component: PlanDetailComponent,
      },
    ]
  },
  
];