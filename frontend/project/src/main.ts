import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { HeroComponent } from './components/hero.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent],
  template: `
    <div class="app">
      <app-hero></app-hero>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
    }
  `]
})
export class App {
}

bootstrapApplication(App);
