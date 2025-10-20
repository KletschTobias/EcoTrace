package at.htl.resources;

import at.htl.dtos.ActivityDto;
import at.htl.services.ActivityService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/activities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ActivityResource {

    @Inject
    ActivityService activityService;

    @GET
    public List<ActivityDto> getAllActivities() {
        return activityService.getAllActivities();
    }

    @GET
    @Path("/{id}")
    public ActivityDto getActivityById(@PathParam("id") Long id) {
        return activityService.getActivityById(id);
    }

    @GET
    @Path("/category/{category}")
    public List<ActivityDto> getActivitiesByCategory(@PathParam("category") String category) {
        return activityService.getActivitiesByCategory(category);
    }

    @POST
    public Response createActivity(ActivityDto activityDto) {
        ActivityDto created = activityService.createActivity(activityDto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteActivity(@PathParam("id") Long id) {
        activityService.deleteActivity(id);
        return Response.noContent().build();
    }
}
