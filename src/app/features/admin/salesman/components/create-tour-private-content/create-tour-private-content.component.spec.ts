import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTourPrivateContentComponent } from './create-tour-private-content.component';

describe('CreateTourPrivateContentComponent', () => {
  let component: CreateTourPrivateContentComponent;
  let fixture: ComponentFixture<CreateTourPrivateContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTourPrivateContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTourPrivateContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
