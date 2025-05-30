import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Blog } from '../../../../../core/models/blog.model';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BlogContentComponent } from './blog-content/blog-content.component';
import { BlogService } from '../../services/blog.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BlogLoadingComponent } from "../../../../../shared/components/blog-loading/blog-loading.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-detail',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    BlogContentComponent,
    NgMultiSelectDropDownModule,
    BlogLoadingComponent,
    FormsModule,
  ],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent {
  editBlogForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  blogId: number | null = null;
  blog!: Blog;

  dropdownList: any = [];
  dropdownSettings: IDropdownSettings = {};
  selectedItems: any = [];

  isLoading: boolean = true;


  constructor(private blogService: BlogService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 5,
      searchPlaceholderText: 'Search Tags Name',
      allowSearchFilter: true
    };

    this.editBlogForm = this.fb.group({
      id: [null, Validators.required],
      title: [null, Validators.required],
      description: [null, Validators.required],
      content: [null, Validators.required],
      tags: [null, Validators.required],
      author: [null, Validators.required],
      thumbnailImageUrl: [null]
    });


    this.route.queryParams.subscribe(params => {
      this.blogId = params['id'];
      if (this.blogId) {
        this.getBlogById(this.blogId);
      }
    });
  }

  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    this.selectedItems = items;
  }

  onDeSelect(item: any) {
    console.log(this.selectedItems);
  }

  getBlogById(id: number): void {
    this.blogService.getBlogById(id).subscribe({
      next: (response) => {
        this.blog = response.data;
        this.isLoading = false

        // Đảm bảo patchValue có cấu trúc giống với form
        this.editBlogForm.patchValue({
          id: this.blog.id,
          title: this.blog.title,
          description: this.blog.description,
          content: this.blog.content,
          tags: this.blog.tags,
          author: this.blog.author,
          thumbnailImageUrl: this.blog.thumbnailImageUrl
        });


        this.getAllTags();


        if (this.blog.thumbnailImageUrl) {
          this.imagePreview = this.blog.thumbnailImageUrl;
        }
      }
    });
  }


  getAllTags(): void {
    this.blogService.getAllTags().subscribe({
      next: (response) => {

        this.dropdownList = response.data.map((tag: { id: string, name: string }) => {
          return {
            item_id: tag.id,
            item_text: tag.name
          };
        });


        this.selectedItems = this.blog.tags.map((tag) => ({
          item_id: tag.id,
          item_text: tag.name,
        }));
      }
    });
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      // Generate a preview URL for the selected image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onCancel(): void {
    this.router.navigate(['/marketer/blog']);
  }



  saveChanges(): void {


    if (this.selectedItems.length <= 0) {
      this.errorMessage = 'Please select at least one tag.';
    } else if (this.selectedFile) {
      this.blogService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.editBlogForm.get('thumbnailImageUrl')?.setValue(response.data);
          this.editBlogForm.get('tags')?.setValue(this.selectedItems.map((tag: any) => ({ id: tag.item_id, name: tag.item_text })));
          this.updateBlog(this.editBlogForm.value);
        }
      });
    } else if (!this.selectedFile) {
      this.editBlogForm.get('tags')?.setValue(this.selectedItems.map((tag: any) => ({ id: tag.item_id, name: tag.item_text })));
      this.updateBlog(this.editBlogForm.value);
    }

    this.resetItems();

  }

  resetItems(): void {
    this.selectedItems = this.selectedItems.map((tag: any) => ({
      item_id: tag.id,
      item_text: tag.name
    }));
  }

  updateBlog(formData: any): void {
    this.blogService.update(formData, formData.id)
      .pipe(
        catchError((error) => {
          const apiError = error?.error?.message || 'An error occurred while updating blog.';
          this.errorMessage = apiError;
          return of(null);
        })
      )
      .subscribe((response: any) => {
        if (response?.code === 200) {
          this.successMessage = response?.message;
          this.errorMessage = null;

        } else if (!response) {

        } else {
          this.errorMessage = response?.message || 'An error occurred while updating blog.';
          this.successMessage = null;
        }

      });
  }

}
