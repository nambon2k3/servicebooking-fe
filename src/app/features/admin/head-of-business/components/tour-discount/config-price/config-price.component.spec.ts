import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPriceComponent } from './config-price.component';

describe('ConfigPriceComponent', () => {
  let component: ConfigPriceComponent;
  let fixture: ComponentFixture<ConfigPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigPriceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
