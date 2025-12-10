
package at.htl.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class KeycloakService {
	private static final Logger LOGGER = Logger.getLogger(KeycloakService.class.getName());

	@ConfigProperty(name = "quarkus.keycloak.auth-server-url")
	String keycloakUrl;

	@ConfigProperty(name = "quarkus.keycloak.realm")
	String realm;

	@ConfigProperty(name = "quarkus.keycloak.admin-client-id")
	String adminClientId;

	@ConfigProperty(name = "quarkus.keycloak.admin-client-secret")
	String adminClientSecret;

	/**
	 * Delete a user from Keycloak by their externalId (user ID)
	 */
	public void deleteKeycloakUser(String userId) {
		try {
			LOGGER.info("Attempting to delete Keycloak user: " + userId);
			String accessToken = getAdminAccessToken();
			if (accessToken == null) {
				LOGGER.warning("Failed to get admin access token for Keycloak user deletion");
				return;
			}
			LOGGER.info("Got admin access token, proceeding with deletion...");

			Client client = ClientBuilder.newClient();
			String deleteUrl = String.format("%s/admin/realms/%s/users/%s", keycloakUrl, realm, userId);
			LOGGER.info("DELETE URL: " + deleteUrl);
            
			var response = client.target(deleteUrl)
					.request(MediaType.APPLICATION_JSON)
					.header("Authorization", "Bearer " + accessToken)
					.delete();
			
			int status = response.getStatus();
			LOGGER.info("Keycloak delete response status: " + status);
			
			if (status == 204) {
				LOGGER.info("✅ Successfully deleted Keycloak user: " + userId);
			} else if (status == 404) {
				LOGGER.warning("⚠️ Keycloak user not found (already deleted?): " + userId);
			} else {
				String body = response.readEntity(String.class);
				LOGGER.warning("❌ Failed to delete Keycloak user " + userId + " - Status: " + status + " Body: " + body);
			}
            
			response.close();
			client.close();
		} catch (Exception e) {
			LOGGER.log(Level.SEVERE, "❌ Exception deleting Keycloak user: " + userId, e);
		}
	}

	/**
	 * Get admin access token from Keycloak
	 */
	private String getAdminAccessToken() {
		try {
			Client client = ClientBuilder.newClient();
			String tokenUrl = String.format("%s/realms/%s/protocol/openid-connect/token", keycloakUrl, realm);
			LOGGER.info("Token URL: " + tokenUrl);
			LOGGER.info("Admin Client ID: " + adminClientId);

			Form form = new Form();
			form.param("grant_type", "client_credentials");
			form.param("client_id", adminClientId);
			form.param("client_secret", adminClientSecret);

			var response = client.target(tokenUrl)
					.request(MediaType.APPLICATION_FORM_URLENCODED)
					.post(Entity.form(form));

			int status = response.getStatus();
			LOGGER.info("Token request status: " + status);

			if (status == 200) {
				var json = response.readEntity(String.class);
				String token = extractAccessToken(json);
				client.close();
				LOGGER.info("Successfully obtained admin token");
				return token;
			} else {
				String body = response.readEntity(String.class);
				LOGGER.warning("Failed to get admin token - Status: " + status + " Body: " + body);
				client.close();
				return null;
			}
		} catch (Exception e) {
			LOGGER.log(Level.SEVERE, "Error getting admin token", e);
			return null;
		}
	}

	/**
	 * Simple JSON parser to extract access_token
	 */
	private String extractAccessToken(String jsonResponse) {
		// Extract "access_token":"..." from JSON
		int startIndex = jsonResponse.indexOf("\"access_token\":\"") + 17;
		int endIndex = jsonResponse.indexOf("\"", startIndex);
		if (startIndex > 16 && endIndex > startIndex) {
			return jsonResponse.substring(startIndex, endIndex);
		}
		return null;
	}
}
