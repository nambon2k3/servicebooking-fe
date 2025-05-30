import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogLoadingComponent } from './blog-loading.component';

describe('BlogLoadingComponent', () => {
  let component: BlogLoadingComponent;
  let fixture: ComponentFixture<BlogLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
