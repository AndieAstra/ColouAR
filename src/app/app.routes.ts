import { Routes } from '@angular/router';
import { HomeComponent } from './shared/home/home.component';
import { ServiceberryWebComponent } from './components/serviceberry/serviceberry-web/serviceberry-web.component';
import { ServiceberryArComponent } from './components/serviceberry/serviceberry-ar/serviceberry-ar.component';
import { TutorialComponent } from './shared/tutorial/tutorial.component';
import { PizzaWebComponent } from './components/pizza/pizza-web/pizza-web.component';
import { PizzaArComponent } from './components/pizza/pizza-ar/pizza-ar.component';
import { AboutComponent } from './shared/about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'serviceberry',
    children: [
      { path: 'berry-web', component: ServiceberryWebComponent },
      { path: 'berry-ar', component: ServiceberryArComponent },
    ],
  },
  {
    path: 'pizza',
    children: [
      { path: 'pizza-web', component: PizzaWebComponent },
      { path: 'pizza-ar', component: PizzaArComponent},
    ],
  },
  { path: 'tutorial', component: TutorialComponent },
];
