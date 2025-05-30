import { Route } from "@angular/router";
import { LayoutComponent } from "../layout/layout.component";
import { ListBlogComponent } from "./components/list-blog/list-blog.component";
import { BlogDetailComponent } from "./components/blog-detail/blog-detail.component";
import { AddBlogComponent } from "./components/add-blog/add-blog.component";

export const MARKETER_ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'blog',
        pathMatch: 'full'
      },
      {
        path: 'blog',
        component: ListBlogComponent
      },
      {
        path: 'blog-details',
        component: BlogDetailComponent,
      },
      {
        path: 'add-blog',
        component: AddBlogComponent,
      }]
  },
];