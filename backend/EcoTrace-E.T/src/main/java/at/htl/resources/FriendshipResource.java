package at.htl.resources;

import at.htl.dtos.FriendshipDto;
import at.htl.dtos.UserDto;
import at.htl.services.FriendshipService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

@Path("/api/users/{userId}/friends")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FriendshipResource {

    @Inject
    FriendshipService friendshipService;

    @GET
    public List<UserDto> getUserFriends(@PathParam("userId") Long userId) {
        return friendshipService.getUserFriends(userId);
    }

    @GET
    @Path("/friendships")
    public List<FriendshipDto> getUserFriendships(@PathParam("userId") Long userId) {
        return friendshipService.getUserFriendships(userId);
    }

    @GET
    @Path("/leaderboard")
    public List<UserDto> getLeaderboard(@PathParam("userId") Long userId) {
        return friendshipService.getLeaderboard(userId);
    }

    @POST
    public Response addFriend(@PathParam("userId") Long userId, Map<String, String> body) {
        String friendEmail = body.get("friendEmail");
        if (friendEmail == null || friendEmail.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", "Friend email is required"))
                    .build();
        }
        
        FriendshipDto friendship = friendshipService.addFriend(userId, friendEmail);
        return Response.status(Response.Status.CREATED).entity(friendship).build();
    }

    @DELETE
    @Path("/{friendshipId}")
    public Response removeFriend(
            @PathParam("userId") Long userId,
            @PathParam("friendshipId") Long friendshipId) {
        friendshipService.removeFriend(userId, friendshipId);
        return Response.noContent().build();
    }
}
