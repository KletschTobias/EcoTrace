package at.htl.resources;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Path("/api/upload")
public class FileUploadResource {

    private static final String UPLOAD_DIR = "uploads/profile-images/";

    @POST
    @Path("/profile-image")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    public Response uploadProfileImage(@org.jboss.resteasy.reactive.RestForm("file") FileUpload file) {
        try {
            // Create upload directory if it doesn't exist
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String originalFileName = file.fileName();
            String fileExtension = getFileExtension(originalFileName);
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            String filePath = UPLOAD_DIR + uniqueFileName;

            // Save file
            Files.copy(file.uploadedFile(), new File(filePath).toPath(), StandardCopyOption.REPLACE_EXISTING);

            // Return the file URL
            String fileUrl = "/uploads/profile-images/" + uniqueFileName;
            return Response.ok().entity("{\"url\":\"" + fileUrl + "\"}").build();

        } catch (IOException e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\":\"Failed to upload file\"}").build();
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return ".jpg";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }
}
