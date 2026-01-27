package at.htl.resources;

import at.htl.dtos.ActivityDto;
import at.htl.services.ActivityService;
import at.htl.services.ActivityImportExportService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;
import org.jboss.logging.Logger;

import java.io.InputStream;
import java.util.List;
import java.util.Set;

@Path("/api/activities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ActivityResource {

    private static final Logger LOG = Logger.getLogger(ActivityResource.class);

    @Inject
    ActivityService activityService;

    @Inject
    ActivityImportExportService importExportService;

    @Inject
    SecurityIdentity securityIdentity;

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
    @RolesAllowed("et-admin")
    public Response createActivity(ActivityDto activityDto) {
        ActivityDto created = activityService.createActivity(activityDto);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("et-admin")
    public Response deleteActivity(@PathParam("id") Long id) {
        activityService.deleteActivity(id);
        return Response.noContent().build();
    }

    @POST
    @Path("/import")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @RolesAllowed("et-admin")
    public Response importActivities(@RestForm FileUpload file, @RestForm("overwrite") Boolean overwrite) {
        try {
            LOG.info("=== Import Request Debug ===");
            LOG.info("User: " + securityIdentity.getPrincipal().getName());
            LOG.info("Is Anonymous: " + securityIdentity.isAnonymous());
            LOG.info("Roles: " + securityIdentity.getRoles());
            LOG.info("Has et-admin role: " + securityIdentity.hasRole("et-admin"));
            LOG.info("==========================");
            
            LOG.info("Importing activities from file: " + file.fileName());
            boolean shouldOverwrite = overwrite != null && overwrite;
            ActivityImportExportService.ImportResult result = importExportService.importActivities(
                file.filePath().toFile().getAbsolutePath(),
                shouldOverwrite
            );
            LOG.info("Import completed: " + result.getMessage());
            return Response.ok(result).build();
        } catch (Exception e) {
            LOG.error("Error importing activities", e);
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("{\"message\": \"" + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/export")
    @Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @RolesAllowed("et-admin")
    public Response exportActivities() {
        try {
            byte[] excelData = importExportService.exportActivities();
            return Response.ok(excelData)
                .header("Content-Disposition", "attachment; filename=\"activities.xlsx\"")
                .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"message\": \"" + e.getMessage() + "\"}")
                .build();
        }
    }
}
