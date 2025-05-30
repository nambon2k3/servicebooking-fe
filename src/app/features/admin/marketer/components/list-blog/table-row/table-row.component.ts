import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Blog } from '../../../../../../core/models/blog.model';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TruncatePipe } from '../../../../../../shared/pipes/truncate.pipe';
import { BlogService } from '../../../services/blog.service';
@Component({
  selector: '[app-table-row]',
  imports: [FormsModule, AngularSvgIconModule, CommonModule, TruncatePipe],
  templateUrl: './table-row.component.html',
  styleUrl: './table-row.component.css',
})
export class TableRowComponent {

  @Input() blog: Blog = <Blog>{};

  authorName: string = 'Loading...';
  tags: string[] = [];

  constructor(private blogService: BlogService,
    private router: Router
  ) { }

  openDetail(blog: Blog): void {
    this.router.navigate(['/marketer/blog-details'],  {
      queryParams: { id: blog.id }
    });
  }

  hideBlog(): void {
    this.blogService.updateBlogStatus(this.blog.id, true).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.blog.deleted = true;
        }
      },
      error: (err) => {
        console.error('Failed to hide blog:', err);
      },
    });
  }

  showBlog(): void {
    this.blogService.updateBlogStatus(this.blog.id, false).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.blog.deleted = false;
        }
      },
      error: (err) => {
        console.error('Failed to show blog:', err);
      },
    });
  }

}
