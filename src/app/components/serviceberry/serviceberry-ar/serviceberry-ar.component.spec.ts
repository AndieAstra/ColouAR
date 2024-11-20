import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceberryArComponent } from './serviceberry-ar.component';

describe('ServiceberryArComponent', () => {
  let component: ServiceberryArComponent;
  let fixture: ComponentFixture<ServiceberryArComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceberryArComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServiceberryArComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
