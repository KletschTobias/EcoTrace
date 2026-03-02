import Keycloak from 'keycloak-js';

export function initializeKeycloak(): Promise<any> {
  const keycloak = new Keycloak({
    url: 'http://localhost:8082',
    realm: 'Eco-Tracer',
    clientId: 'ecotrace-frontend'
  });

  return keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    checkLoginIframe: false, // Disable iframe check for better compatibility
    pkceMethod: 'S256' // Use PKCE for better security
  }).then((authenticated) => {
    console.log('[Keycloak] Initialization successful. Authenticated:', authenticated);
    if (authenticated && keycloak.token) {
      console.log('[Keycloak] Token:', keycloak.token.substring(0, 20) + '...');
      console.log('[Keycloak] User:', keycloak.idTokenParsed?.['preferred_username']);
      
      // Refresh token before it expires
      keycloak.onTokenExpired = () => {
        console.log('[Keycloak] Token expired, refreshing...');
        keycloak.updateToken(70).then((refreshed) => {
          if (refreshed) {
            console.log('[Keycloak] Token refreshed');
          } else {
            console.warn('[Keycloak] Token still valid');
          }
        }).catch(() => {
          console.error('[Keycloak] Failed to refresh token');
        });
      };
    }
    return keycloak;
  }).catch((error) => {
    console.error('[Keycloak] Initialization failed:', error);
    // Return keycloak instance anyway so app can still start
    return keycloak;
  });
}
