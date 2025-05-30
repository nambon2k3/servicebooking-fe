import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListServiceProviderComponent } from './view-list-service-provider.component';

describe('ViewListServiceProviderComponent', () => {
  let component: ViewListServiceProviderComponent;
  let fixture: ComponentFixture<ViewListServiceProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewListServiceProviderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewListServiceProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
