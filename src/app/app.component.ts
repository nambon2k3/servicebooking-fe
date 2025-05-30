import { Component, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet],
})
export class AppComponent implements AfterViewInit {
  title = 'Viet Travel';
  isBrowser: boolean = false;
  isServer: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.isServer = isPlatformServer(this.platformId);

    if (this.isBrowser) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.reInitFlowbite(); 
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initializeClientFeatures();
      this.reInitFlowbite(); 
    }
  }

  private initializeClientFeatures(): void {
    setTimeout(() => {
      if (this.isBrowser) {
        document.title = 'Viet Travel - Explore the World';
      }
    }, 100);
  }

  private reInitFlowbite(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        initFlowbite(); 
      }, 0); 
    }
  }
}