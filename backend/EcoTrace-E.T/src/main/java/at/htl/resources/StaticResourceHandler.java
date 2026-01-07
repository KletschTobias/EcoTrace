package at.htl.resources;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

import java.io.File;
import java.nio.file.Files;

@Path("/uploads")
public class StaticResourceHandler {

    @GET
    @Path("/profile-images/{filename}")
    @Produces("image/*")
    public Response getProfileImage(@PathParam("filename") String filename) {
        try {
            File file = new File("uploads/profile-images/" + filename);
            if (!file.exists()) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            
            byte[] imageData = Files.readAllBytes(file.toPath());
            String contentType = Files.probeContentType(file.toPath());
            
            return Response.ok(imageData)
                    .type(contentType != null ? contentType : "image/jpeg")
                    .build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
}
