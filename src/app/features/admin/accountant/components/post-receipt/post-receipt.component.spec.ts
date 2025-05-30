import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostReceiptComponent } from './post-receipt.component';

describe('PostReceiptComponent', () => {
  let component: PostReceiptComponent;
  let fixture: ComponentFixture<PostReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
