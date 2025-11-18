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
    @Transactional
    public void filter(ContainerRequestContext requestContext) {
        if (jwt == null) {
            return;
        }

        try {
            // Extract Keycloak subject (sub claim) as externalId
            String externalId = jwt.getSubject();
            if (externalId == null || externalId.isBlank()) {
                return;
            }

            // If user does not exist, create lightweight local profile with only externalId
            User existing = User.findByExternalId(externalId);
            if (existing == null) {
                User u = new User();
                u.externalId = externalId;
                // avatarColor will be auto-generated in @PrePersist
                u.persist();
            }
        } catch (Exception ex) {
            // Don't block request on provisioning errors
        }
    }
}
