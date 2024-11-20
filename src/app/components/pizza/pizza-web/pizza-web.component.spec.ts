import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PizzaWebComponent } from './pizza-web.component';

describe('PizzaWebComponent', () => {
  let component: PizzaWebComponent;
  let fixture: ComponentFixture<PizzaWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PizzaWebComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PizzaWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
