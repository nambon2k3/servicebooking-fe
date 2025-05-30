import { Component, computed, signal } from '@angular/core';
import { TableFooterComponent } from '../../../../../shared/components/table/table-footer/table-footer.component';
import { TableHeaderComponent } from './table-header/table-header.component';
import { Blog } from '../../../../../core/models/blog.model';
import { TableRowComponent } from './table-row/table-row.component';
import { TableActionComponent } from './table-action/table-action.component';
import { Router } from '@angular/router';
import { SpinnerComponent } from "../../../../../shared/components/spinner/spinner.component";
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-list-blog',
  imports: [TableActionComponent,
    TableFooterComponent,
    TableHeaderComponent,
    TableRowComponent, SpinnerComponent],
  templateUrl: './list-blog.component.html',
  styleUrl: './list-blog.component.css'
})
export class ListBlogComponent {
  
  blogs = signal<Blog[]>([]);
  totalItems = 0;
  page = 0;
  size = 10;
  totalPages = signal(0)
  isLoading: boolean = false;

  
  // Store filters to persist data across pages
  keyword = '';
  isDeleted?: boolean;
  sortField = 'createdAt';
  sortDirection = 'desc';

  constructor(
    private router: Router,
    private blogService: BlogService) { }

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.isLoading = true;
    this.blogService.getBlogByPage(
      this.page,
      this.size,
      this.keyword,
      this.isDeleted,
      this.sortField,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.blogs.set(response.data.items);
        this.totalItems = response.data.total;
        this.page = response.data.page;
        this.size = response.data.size;
        this.totalPages.set(Math.ceil(this.totalItems / this.size));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load blogs:', err);
      }
    });
  }


  onSearch(filters: any): void {
    this.keyword = filters.keyword || '';
    this.isDeleted = filters.status === '2' ? true : filters.status === '1' ? false : undefined;
    this.sortDirection = filters.order === '1' ? 'desc' : 'asc';
    this.page = 0; // Reset to first page on new search
    this.loadBlogs();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages()) {
      this.page = newPage;
      this.loadBlogs();
    }
  }

  // Change page size and reload data
  onPageSizeChange(newSize: number): void {
    this.size = newSize;
    this.page = 0; // Reset to first page
    this.loadBlogs();
  }

  openPostBlogDetail(): void {
    this.router.navigate(['/marketer/add-blog']);
  }

  public toggleBlogs(checked: boolean): void {
    this.blogs.update((blogs) => {
      return blogs.map((blog) => {
        return { ...blog, selected: checked };
      });
    });

  }

  filteredBlogs = computed(() => {
    return this.blogs();
  });
}
