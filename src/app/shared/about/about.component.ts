import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {

  images: { src: string; text: string; alt: string }[] = [
    { src: 'assets/images/gallery1.png', text: 'DIALL Lab AR' , alt: 'Augmented Reality Example 1' },
    { src: 'assets/images/gallery2.png', text: 'The Tridactic Ballet AR Coloring Pages' , alt: 'Augmented Reality Example 2' },
    { src: 'assets/images/gallery3.png', text: 'Wingin It: Youth AR Workshop' , alt: 'Augmented Reality Example 3' }
    // Add more images as needed
  ];

  constructor() { }

  ngOnInit(): void {
  }
}
