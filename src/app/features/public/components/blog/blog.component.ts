import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../../../core/models/blog.model';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../../../../shared/components/footer/footer.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog',
  imports: [CommonModule, FooterComponent],
  templateUrl: './blog.component.html',  
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  foodAndDrinkBlogs: Blog[] = [];
  culturalBlogs: Blog[] = [];
  adventureBlogs: Blog[] = [];
  newestBlogs: Blog[] = [];
  randomBlogs: Blog[] = [];

  currentPage: number = 0;
  totalPages: number = 0;
  pageSize = 9;

  constructor(
    private blogService: BlogService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Fetch blogs by tags
    this.getFoodBlogs();
    this.getAdventureBlogs();
    this.getCulturalBlogs();
    this.fetchNewestBlogs();
    this.getRandomBlogs();
  }

  // Fetch blogs by tag and assign to the corresponding property
  getFoodBlogs(): void {
    this.blogService.getFoodBlogs().subscribe({
      next: (res) => {
        this.foodAndDrinkBlogs = res;
      },
      error: (err) => {
        console.error('Fetching foodAndDrinkBlogs data failed:', err);
      }
    });
  }

  getRandomBlogs(): void {
    this.blogService.getRandomBlogs().subscribe({
      next: (res) => {
        this.randomBlogs = res.data;
      },
      error: (err) => {
        console.error('Fetching randomBlogs data failed:', err);
      }
    });
  }

  getCulturalBlogs(): void {
    this.blogService.getCulturalBlogs().subscribe({
      next: (res) => {
        this.culturalBlogs = res;
      },
      error: (err) => {
        console.error('Fetching culturalBlogs data failed:', err);
      }
    });
  }

  getAdventureBlogs(): void {
    this.blogService.getAdventureBlogs().subscribe({
      next: (res) => {
        this.adventureBlogs = res;
      },
      error: (err) => {
        console.error('Fetching adventureBlogs data failed:', err);
      }
    });
  }

  fetchNewestBlogs(): void {
    this.blogService.getNewestBlog(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.newestBlogs = res.data.items;
        this.totalPages = Math.ceil(res.data.total / this.pageSize); // Tính tổng số trang
      },
      error: (err) => {
        console.error('Fetching newestBlogs data:', err);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchNewestBlogs();
    }
  }

  openBlogDetail(blogid: number | undefined) {
    if (blogid) {
      this.router.navigate(['/blog-details', blogid]);
    } else {
      console.error('Invalid blog id');
    }
  }

  currentIndex = 0;

  prevArticle() {
    this.currentIndex = (this.currentIndex - 1 + this.foodAndDrinkBlogs.length) % this.foodAndDrinkBlogs.length;
  }

  nextArticle() {
    this.currentIndex = (this.currentIndex + 1) % this.foodAndDrinkBlogs.length;
  }
}