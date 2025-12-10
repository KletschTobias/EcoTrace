package at.htl.filters;

import at.htl.entities.User;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Provider
@ApplicationScoped
@Priority(Priorities.AUTHENTICATION)
public class KeycloakUserFilter implements ContainerRequestFilter {

    @Inject
    JsonWebToken jwt;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (jwt == null) {
            return;
        }

        // Extract Keycloak subject (sub claim) as externalId
        String externalId = jwt.getSubject();
        if (externalId == null || externalId.isBlank()) {
            return;
        }

        // Check if user exists - if not, they will be auto-created by AuthService.getCurrentUser()
        // We don't create here to avoid duplicate key race conditions
        User existing = User.findByExternalId(externalId);
        // User will be created on-demand by first authenticated endpoint call
    }
}
