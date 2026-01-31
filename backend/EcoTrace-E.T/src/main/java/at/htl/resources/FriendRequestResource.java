package at.htl.resources;

import at.htl.dtos.FriendRequestDto;
import at.htl.services.AuthService;
import at.htl.services.FriendRequestService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;

@Path("/api/friend-requests")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FriendRequestResource {

    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    @Inject
    FriendRequestService friendRequestService;

    @POST
    @Transactional
    @RolesAllowed({"et-user"})
    public Response sendFriendRequest(Map<String, String> request) {
        try {
            Long userId = authService.getCurrentUserId(jwt);
            String receiverIdentifier = request.get("receiverIdentifier");

            if (receiverIdentifier == null || receiverIdentifier.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("message", "Receiver identifier is required"))
                        .build();
            }
            
            FriendRequestDto dto = friendRequestService.sendFriendRequest(userId, receiverIdentifier);
            return Response.ok(dto).build();
        } catch (NotFoundException e) {
            io.quarkus.logging.Log.error("FriendRequest failed (404): " + e.getMessage());
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        } catch (BadRequestException e) {
             io.quarkus.logging.Log.error("FriendRequest failed (400): " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", e.getMessage()))
                    .build();
        } catch (Exception e) {
            io.quarkus.logging.Log.error("FriendRequest failed (500)", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("message", "Internal server error: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/received")
    @RolesAllowed({"et-user"})
    public Response getReceivedRequests() {
        Long userId = authService.getCurrentUserId(jwt);
        List<FriendRequestDto> requests = friendRequestService.getPendingReceivedRequests(userId);
        return Response.ok(requests).build();
    }

    @GET
    @RolesAllowed({"et-user"})
    @Path("/sent")
    public Response getSentRequests() {
        Long userId = authService.getCurrentUserId(jwt);
        List<FriendRequestDto> requests = friendRequestService.getPendingSentRequests(userId);
        return Response.ok(requests).build();
    }

    @POST
    @RolesAllowed({"et-user"})
    @Path("/{requestId}/accept")
    public Response acceptRequest(@PathParam("requestId") Long requestId) {
        Long userId = authService.getCurrentUserId(jwt);
        FriendRequestDto dto = friendRequestService.acceptFriendRequest(requestId, userId);
        return Response.ok(dto).build();
    }

    @POST
    @RolesAllowed({"et-user"})
    @Path("/{requestId}/reject")
    public Response rejectRequest(@PathParam("requestId") Long requestId) {
        Long userId = authService.getCurrentUserId(jwt);
        FriendRequestDto dto = friendRequestService.rejectFriendRequest(requestId, userId);
        return Response.ok(dto).build();
    }

    @RolesAllowed({"et-user"})
    @DELETE
    @Path("/{requestId}")
    public Response cancelRequest(@PathParam("requestId") Long requestId) {
        Long userId = authService.getCurrentUserId(jwt);
        friendRequestService.cancelFriendRequest(requestId, userId);
        return Response.noContent().build();
    }
}
