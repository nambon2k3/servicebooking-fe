import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigMarkupComponent } from './config-markup.component';

describe('ConfigMarkupComponent', () => {
  let component: ConfigMarkupComponent;
  let fixture: ComponentFixture<ConfigMarkupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigMarkupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigMarkupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
