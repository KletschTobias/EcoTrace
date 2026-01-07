package at.htl.resources;

import at.htl.dtos.ActivityDto;
import at.htl.services.ActivityImportExportService;
import at.htl.services.ActivityService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Path("/api/activities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ActivityResource {

    @Inject
    ActivityService activityService;
    
    @Inject
    ActivityImportExportService importExportService;

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
    
    /**
     * Export all activities to Excel file
     */
    @GET
    @Path("/export")
    @Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public Response exportActivities() {
        try {
            byte[] excelData = importExportService.exportActivities();
            return Response.ok(excelData)
                    .header("Content-Disposition", "attachment; filename=activities.xlsx")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Export failed: " + e.getMessage()))
                    .build();
        }
    }
    
    /**
     * Import activities from Excel file (Admin only)
     * @param mode 'append' to add new activities (skip duplicates) or 'overwrite' to update existing
     */
    @POST
    @Path("/import")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @RolesAllowed("admin")
    public Response importActivities(
            @FormParam("file") InputStream fileInputStream,
            @QueryParam("mode") @DefaultValue("append") String mode) {
        try {
            boolean overwrite = "overwrite".equalsIgnoreCase(mode);
            ActivityImportExportService.ImportResult result = 
                    importExportService.importActivities(fileInputStream, overwrite);
            
            return Response.ok(Map.of(
                    "message", result.getMessage(),
                    "imported", result.importedCount,
                    "updated", result.updatedCount,
                    "duplicates", result.duplicateCount,
                    "duplicateNames", result.duplicates,
                    "skipped", result.skippedCount,
                    "errors", result.errors
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Import failed: " + e.getMessage()))
                    .build();
        }
    }
}
