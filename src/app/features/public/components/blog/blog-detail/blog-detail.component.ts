import { Component, OnInit } from '@angular/core';
import { Blog } from '../../../../../core/models/blog.model';
import { DatePipe } from '@angular/common';
import { BlogLoadingComponent } from "../../../../../shared/components/blog-loading/blog-loading.component";
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../../services/blog.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [DatePipe, BlogLoadingComponent],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | undefined;
  isLoading: boolean = true;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const blogId = Number(this.route.snapshot.paramMap.get('id'));
    if (blogId) {
      this.blogService.getBlogById(blogId).subscribe({
        next: (response) => {
          this.blog = response.data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load blog:', err);
        }
      });
    } else {
      console.error('Invalid blog id');
    }
  }
}
