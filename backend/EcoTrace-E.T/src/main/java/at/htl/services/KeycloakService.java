
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
	 * Update user's full name in Keycloak
	 */
	public void updateKeycloakUserName(String userId, String firstName, String lastName) {
		try {
			LOGGER.info("Attempting to update Keycloak user: " + userId + " with name: " + firstName + " " + lastName);
			String accessToken = getAdminAccessToken();
			if (accessToken == null) {
				LOGGER.warning("Failed to get admin access token for Keycloak user update");
				return;
			}

			Client client = ClientBuilder.newClient();
			String updateUrl = String.format("%s/admin/realms/%s/users/%s", keycloakUrl, realm, userId);
			LOGGER.info("PUT URL: " + updateUrl);

			// Build JSON payload manually
			String jsonPayload = String.format("{\"firstName\":\"%s\",\"lastName\":\"%s\"}", 
				firstName != null ? firstName : "", 
				lastName != null ? lastName : "");

			var response = client.target(updateUrl)
					.request(MediaType.APPLICATION_JSON)
					.header("Authorization", "Bearer " + accessToken)
					.put(Entity.json(jsonPayload));
			
			int status = response.getStatus();
			LOGGER.info("Keycloak update response status: " + status);
			
			if (status == 204 || status == 200) {
				LOGGER.info("✅ Successfully updated Keycloak user: " + userId);
			} else {
				String body = response.readEntity(String.class);
				LOGGER.warning("❌ Failed to update Keycloak user " + userId + " - Status: " + status + " Body: " + body);
			}
            
			response.close();
			client.close();
		} catch (Exception e) {
			LOGGER.log(Level.SEVERE, "❌ Exception updating Keycloak user: " + userId, e);
		}
	}

	/**
	 * Get admin access token from Keycloak
	 */
	/**
	 * Search for a user in Keycloak by username or email
	 * Returns null if not found, or a Map containing user details (id, username, email, firstName, lastName)
	 */
	public java.util.Map<String, String> findUser(String search) {
		try {
			LOGGER.info("Searching Keycloak user: " + search);
			String accessToken = getAdminAccessToken();
			if (accessToken == null) return null;

			Client client = ClientBuilder.newClient();
			// Search by username (exact) first
			String searchUrl = String.format("%s/admin/realms/%s/users?username=%s&exact=true", keycloakUrl, realm, search);
			
			var response = client.target(searchUrl)
					.request(MediaType.APPLICATION_JSON)
					.header("Authorization", "Bearer " + accessToken)
					.get();
			
			if (response.getStatus() != 200) {
				LOGGER.warning("Keycloak search failed: " + response.getStatus());
				response.close();
				client.close();
				return null;
			}
			
			java.util.List<java.util.Map<String, Object>> users = response.readEntity(new jakarta.ws.rs.core.GenericType<java.util.List<java.util.Map<String, Object>>>() {});
			response.close();

			// If not found, try search by email (users?email=...)
			if (users == null || users.isEmpty()) {
				// Note: Keycloak search param matches username, email, first, last. But we want to be specific.
				// Let's try the general 'search' param which matches multiple fields.
				searchUrl = String.format("%s/admin/realms/%s/users?search=%s", keycloakUrl, realm, search);
				response = client.target(searchUrl)
						.request(MediaType.APPLICATION_JSON)
						.header("Authorization", "Bearer " + accessToken)
						.get();
				users = response.readEntity(new jakarta.ws.rs.core.GenericType<java.util.List<java.util.Map<String, Object>>>() {});
				response.close();
			}
			
			client.close();

			if (users != null && !users.isEmpty()) {
				// Pick the first match that matches exactly if possible, otherwise just the first
				var kUser = users.get(0);
				
				java.util.Map<String, String> result = new java.util.HashMap<>();
				result.put("id", (String) kUser.get("id"));
				result.put("username", (String) kUser.get("username"));
				result.put("email", (String) kUser.get("email"));
				result.put("firstName", (String) kUser.get("firstName"));
				result.put("lastName", (String) kUser.get("lastName"));
				return result;
			}
			
			return null;
		} catch (Exception e) {
			LOGGER.log(Level.SEVERE, "Exception searching Keycloak user: " + search, e);
			return null;
		}
	}

	private String getAdminAccessToken() {
		try {
			// Get token from Eco-Tracer realm using admin user credentials
			// The admin user was created by start.js with et-admin role
			String baseUrl = "http://localhost:8082";
			if (keycloakUrl != null && keycloakUrl.contains("/realms/")) {
				baseUrl = keycloakUrl.substring(0, keycloakUrl.indexOf("/realms/"));
			} else if (keycloakUrl != null && !keycloakUrl.contains("/protocol")) {
				baseUrl = keycloakUrl;
			}
			
			// Token from Eco-Tracer realm, not master
			String tokenUrl = String.format("%s/realms/Eco-Tracer/protocol/openid-connect/token", baseUrl);
			LOGGER.info("Token URL: " + tokenUrl);
			
			Client client = ClientBuilder.newClient();
			Form form = new Form();
			form.param("grant_type", "password");
			form.param("client_id", "admin-cli");
			form.param("username", "admin");
			form.param("password", "admin");

			var response = client.target(tokenUrl)
					.request(MediaType.APPLICATION_JSON)
					.post(Entity.form(form));

			int status = response.getStatus();
			LOGGER.info("Token request status: " + status);

			if (status == 200) {
				String jsonResponse = response.readEntity(String.class);
				String token = extractAccessToken(jsonResponse);
				LOGGER.info("Successfully obtained admin token from Eco-Tracer realm");
				client.close();
				return token;
			} else {
				String error = response.readEntity(String.class);
				LOGGER.severe("Failed to get admin token: " + status + " - " + error);
				client.close();
				return null;
			}
		} catch (Exception e) {
			LOGGER.log(Level.SEVERE, "Exception getting admin token", e);
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
