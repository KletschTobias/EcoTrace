package at.htl.resources;

import at.htl.dtos.CreateLeagueRequest;
import at.htl.dtos.LeagueDto;
import at.htl.dtos.LeagueMemberDto;
import at.htl.services.AuthService;
import at.htl.services.LeagueService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;

@Path("/api/leagues")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed({"et-user"})
public class LeagueResource {

    @Inject
    AuthService authService;

    @Inject
    JsonWebToken jwt;

    @Inject
    LeagueService leagueService;

    @POST
    public Response createLeague(CreateLeagueRequest request) {
        Long userId = authService.getCurrentUserId(jwt);
        LeagueDto dto = leagueService.createLeague(userId, request);
        return Response.ok(dto).build();
    }

    @GET
    @Path("/public")
    public Response getPublicLeagues() {
        Long userId = authService.getCurrentUserId(jwt);
        List<LeagueDto> leagues = leagueService.getPublicLeagues(userId);
        return Response.ok(leagues).build();
    }

    @GET
    @Path("/my-leagues")
    public Response getMyLeagues() {
        Long userId = authService.getCurrentUserId(jwt);
        List<LeagueDto> leagues = leagueService.getUserLeagues(userId);
        return Response.ok(leagues).build();
    }

    @GET
    @Path("/{leagueId}")
    public Response getLeague(@PathParam("leagueId") Long leagueId) {
        Long userId = authService.getCurrentUserId(jwt);
        LeagueDto dto = leagueService.getLeague(leagueId, userId);
        return Response.ok(dto).build();
    }

    @GET
    @Path("/{leagueId}/members")
    public Response getLeagueMembers(@PathParam("leagueId") Long leagueId) {
        List<LeagueMemberDto> members = leagueService.getLeagueMembers(leagueId);
        return Response.ok(members).build();
    }

    @POST
    @Path("/{leagueId}/join")
    public Response joinLeague(@PathParam("leagueId") Long leagueId) {
        Long userId = authService.getCurrentUserId(jwt);
        LeagueDto dto = leagueService.joinLeague(userId, leagueId);
        return Response.ok(dto).build();
    }

    @DELETE
    @Path("/{leagueId}/leave")
    public Response leaveLeague(@PathParam("leagueId") Long leagueId) {
        Long userId = authService.getCurrentUserId(jwt);
        leagueService.leaveLeague(userId, leagueId);
        return Response.noContent().build();
    }

    @POST
    @Path("/{leagueId}/invite")
    public Response inviteUser(@PathParam("leagueId") Long leagueId, Map<String, String> request) {
        Long userId = authService.getCurrentUserId(jwt);
        String userIdentifier = request.get("userIdentifier");
        leagueService.inviteToLeague(userId, leagueId, userIdentifier);
        return Response.ok().build();
    }

    @POST
    @Path("/{leagueId}/accept-invitation")
    public Response acceptInvitation(@PathParam("leagueId") Long leagueId) {
        Long userId = authService.getCurrentUserId(jwt);
        leagueService.acceptInvitation(userId, leagueId);
        return Response.ok().build();
    }

    @POST
    @Path("/{leagueId}/kick/{memberId}")
    public Response kickMember(@PathParam("leagueId") Long leagueId, @PathParam("memberId") Long memberId) {
        Long userId = authService.getCurrentUserId(jwt);
        leagueService.kickMember(userId, leagueId, memberId);
        return Response.ok().build();
    }

    @POST
    @Path("/{leagueId}/refresh-stats")
    public Response refreshStats(@PathParam("leagueId") Long leagueId) {
        leagueService.updateAllMemberStatsForLeague(leagueId);
        return Response.ok().build();
    }
}
