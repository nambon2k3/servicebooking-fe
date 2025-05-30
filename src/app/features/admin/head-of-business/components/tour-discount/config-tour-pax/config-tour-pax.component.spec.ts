import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigTourPaxComponent } from './config-tour-pax.component';

describe('ConfigTourPaxComponent', () => {
  let component: ConfigTourPaxComponent;
  let fixture: ComponentFixture<ConfigTourPaxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigTourPaxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigTourPaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
