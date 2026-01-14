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
  realm: 'Eco-Tracer',
  clientId: 'ecotrace-frontend'
});

function logStorageState(label: string) {
  const sessionKeys = Object.keys(sessionStorage);
  const kcKeys = sessionKeys.filter(k => k.toLowerCase().includes('kc'));
  console.log(`[Keycloak][${label}] sessionStorage keys (${kcKeys.length}):`, kcKeys);
  const stateKey = kcKeys.find(k => k.includes('state') || k.includes('nonce'));
  if (stateKey) {
    console.log(`[Keycloak][${label}] sample key '${stateKey}' value:`, sessionStorage.getItem(stateKey));
  }
}

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

// Start app immediately without waiting for Keycloak
console.log('[App] Starting Angular app immediately (Keycloak loading in background)...');

// Initialize Keycloak with standard flow (Authorization Code) 
console.log('[Keycloak] Attempting to initialize...');

const initialUrl = window.location.href;
console.log('[Keycloak] Initial URL:', initialUrl);

// Log storage state before init to diagnose nonce loss
logStorageState('before-init');
console.log('[Keycloak][before-init] kc.authenticated =', keycloak.authenticated, 'token?', !!keycloak.token);

keycloak.init({
  onLoad: 'check-sso',
  pkceMethod: 'S256',
  enableLogging: true,
  // Keep current location after refresh (don't redirect)
  redirectUri: window.location.href,
  adapter: 'default',
  // Default responseMode (fragment) + standard flow
  responseMode: 'fragment',
  flow: 'standard',
  // Temporär: Nonce-Validierung ausschalten, weil SessionStorage den Nonce verliert
  useNonce: false,
  // Reduziert Nebenpfade, die Storage beeinflussen können
  checkLoginIframe: false
})
  .then((authenticated) => {
    console.log('[Keycloak] ✅ Init success. Authenticated:', authenticated);
    console.log('[Keycloak] Token exists:', !!keycloak.token);
    logStorageState('after-init-success');
    if (authenticated || keycloak.token) {
      console.log('[Keycloak] ✅ User is authenticated!');
      console.log('[Keycloak] User:', keycloak.idTokenParsed?.['sub'] || 'N/A');
    }
    startApp(keycloak);
  })
  .catch((error) => {
    console.warn('[Keycloak] ❌ Init failed:', error);
    console.log('[Keycloak] Token available?', !!keycloak.token);
    logStorageState('after-init-failure');
    startApp(keycloak);
  });
