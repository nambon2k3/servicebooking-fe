import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostLocationDetailComponent } from './post-location-detail.component';

describe('PostLocationDetailComponent', () => {
  let component: PostLocationDetailComponent;
  let fixture: ComponentFixture<PostLocationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostLocationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostLocationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
