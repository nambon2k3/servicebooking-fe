import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateServiceProviderComponent } from './update-service-provider.component';

describe('UpdateServiceProviderComponent', () => {
  let component: UpdateServiceProviderComponent;
  let fixture: ComponentFixture<UpdateServiceProviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateServiceProviderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateServiceProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
