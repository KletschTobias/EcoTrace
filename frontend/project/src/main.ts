import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import { initializeKeycloak } from './app/keycloak.init';
import { KeycloakInterceptor } from './app/keycloak.interceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app">
      <router-outlet></router-outlet>
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

// Initialize Keycloak first, then bootstrap Angular
initializeKeycloak().then((keycloak) => {
  bootstrapApplication(App, {
    providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptorsFromDi()),
      { provide: 'KEYCLOAK', useValue: keycloak },
      { provide: HTTP_INTERCEPTORS, useClass: KeycloakInterceptor, multi: true }
    ]
  }).catch(err => console.error(err));
}).catch(err => {
  console.error('Failed to initialize Keycloak:', err);
});
