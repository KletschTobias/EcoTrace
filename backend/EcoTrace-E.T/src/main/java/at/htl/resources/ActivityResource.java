package at.htl.resources;

import at.htl.dtos.ActivityDto;
import at.htl.services.ActivityService;
import at.htl.services.ActivityImportExportService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.FileInputStream;
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
     * Export all activities as Excel file
     */
    @GET
    @Path("/export")
    @Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public Response exportActivities() {
        try {
            byte[] excelData = importExportService.exportActivities();
            return Response.ok(excelData)
                    .header("Content-Disposition", "attachment; filename=\"activities.xlsx\"")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to export activities: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Import activities from Excel file and auto-sync import.sql
     */
    @POST
    @Path("/import")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response importActivities(
            @org.jboss.resteasy.reactive.RestForm("file") FileUpload file,
            @org.jboss.resteasy.reactive.RestForm("syncMode") @DefaultValue("true") boolean syncMode) {
        try {
            ActivityImportExportService.ImportResult result = 
                importExportService.importActivities(new FileInputStream(file.uploadedFile().toFile()), syncMode);
            
            // Auto-sync import.sql after successful import
            importExportService.syncImportSql();
            
            return Response.ok(Map.of(
                "message", result.getMessage(),
                "importedCount", result.importedCount,
                "updatedCount", result.updatedCount,
                "duplicateCount", result.duplicateCount,
                "skippedCount", result.skippedCount,
                "deletedCount", result.deletedCount,
                "duplicates", result.duplicates,
                "errors", result.errors,
                "sqlSynced", true
            )).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to import activities: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Generate import.sql from current database state
     */
    @GET
    @Path("/export/sql")
    @Produces(MediaType.TEXT_PLAIN)
    public Response exportImportSql() {
        try {
            String sql = importExportService.generateImportSql();
            return Response.ok(sql)
                    .header("Content-Disposition", "attachment; filename=\"import.sql\"")
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Failed to generate SQL: " + e.getMessage())
                    .build();
        }
    }
}
