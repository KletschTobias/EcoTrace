import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { routes } from './app.routes';
import Keycloak from 'keycloak-js';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
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

// Initialize Keycloak client
const keycloak = new Keycloak({
  url: 'http://localhost:8081',
  realm: 'eco-tracer',
  clientId: 'ecotrace-frontend'
});

// Start app immediately, Keycloak initializes in background
function startApp(kc: any) {
  bootstrapApplication(App, {
    providers: [
      provideRouter(routes),
      provideHttpClient(withInterceptorsFromDi()),
      { provide: 'KEYCLOAK', useValue: kc },
      { provide: HTTP_INTERCEPTORS, useClass: KeycloakInterceptor, multi: true }
    ]
  }).catch((err: any) => console.error(err));
}

// Try to initialize Keycloak but don't wait
keycloak.init({ onLoad: 'check-sso', pkceMethod: 'S256', silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html' })
  .then((authenticated) => {
    console.log('Keycloak initialized. Authenticated:', authenticated);
  })
  .catch((error) => {
    console.warn('Keycloak init failed:', error);
  });

// Start app immediately without waiting for Keycloak
startApp(keycloak);
