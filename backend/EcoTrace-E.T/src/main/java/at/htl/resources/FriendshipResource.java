package at.htl.resources;

import at.htl.dtos.FriendshipDto;
import at.htl.dtos.UserDto;
import at.htl.services.AuthService;
import at.htl.services.FriendshipService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;

@Path("/api/users/me/friends")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"ROLE_USER", "et-user"})
public class FriendshipResource {

    @Inject
    FriendshipService friendshipService;

    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    @GET
    public List<UserDto> getUserFriends() {
        Long userId = authService.getCurrentUserId(jwt);
        return friendshipService.getUserFriends(userId);
    }

    @GET
    @Path("/friendships")
    public List<FriendshipDto> getUserFriendships() {
        Long userId = authService.getCurrentUserId(jwt);
        return friendshipService.getUserFriendships(userId);
    }

    @GET
    @Path("/leaderboard")
    public List<UserDto> getLeaderboard() {
        Long userId = authService.getCurrentUserId(jwt);
        return friendshipService.getLeaderboard(userId);
    }

    @POST
    public Response addFriend(Map<String, String> body) {
        String friendIdentifier = body.get("friendEmail") != null ? 
            body.get("friendEmail") : body.get("friendExternalId");
        
        if (friendIdentifier == null || friendIdentifier.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", "Friend email or externalId is required"))
                    .build();
        }
        
        Long userId = authService.getCurrentUserId(jwt);
        FriendshipDto friendship = friendshipService.addFriend(userId, friendIdentifier);
        return Response.status(Response.Status.CREATED).entity(friendship).build();
    }

    @DELETE
    @Path("/{friendshipId}")
    public Response removeFriend(@PathParam("friendshipId") Long friendshipId) {
        Long userId = authService.getCurrentUserId(jwt);
        friendshipService.removeFriend(userId, friendshipId);
        return Response.noContent().build();
    }
}
