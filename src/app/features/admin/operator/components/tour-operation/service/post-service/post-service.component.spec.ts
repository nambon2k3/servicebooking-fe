import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostServiceComponent } from './post-service.component';

describe('PostServiceComponent', () => {
  let component: PostServiceComponent;
  let fixture: ComponentFixture<PostServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
