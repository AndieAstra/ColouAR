import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PizzaArComponent } from './pizza-ar.component';

describe('PizzaArComponent', () => {
  let component: PizzaArComponent;
  let fixture: ComponentFixture<PizzaArComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PizzaArComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PizzaArComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
