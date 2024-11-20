import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  // Track the dropdown menu states
  dropdownStates: { [key: string]: boolean } = {};

  toggleDropdown(menuId: string): void {
    // Toggle the state of the specified dropdown
    this.dropdownStates[menuId] = !this.dropdownStates[menuId];
  }

  isDropdownOpen(menuId: string): boolean {
    // Return the current state of the dropdown
    return this.dropdownStates[menuId] || false;
  }
}
