package at.htl.resources;

import at.htl.dtos.LoginRequest;
import at.htl.dtos.RegisterRequest;
import at.htl.dtos.UserDto;
import at.htl.services.AuthService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/register")
    public Response register(@Valid RegisterRequest request) {
        UserDto userDto = authService.register(request);
        return Response.status(Response.Status.CREATED).entity(userDto).build();
    }

    @POST
    @Path("/login")
    public Response login(@Valid LoginRequest request) {
        UserDto userDto = authService.login(request);
        return Response.ok(userDto).build();
    }

    @GET
    @Path("/users")
    public List<UserDto> getAllUsers() {
        return authService.getAllUsers();
    }

    @GET
    @Path("/users/{id}")
    public UserDto getUserById(@PathParam("id") Long id) {
        return authService.getUserById(id);
    }

    @PUT
    @Path("/users/{id}")
    public UserDto updateUser(@PathParam("id") Long id, UserDto userDto) {
        return authService.updateUser(id, userDto);
    }

    @DELETE
    @Path("/users/{id}")
    public Response deleteUser(@PathParam("id") Long id) {
        authService.deleteUser(id);
        return Response.noContent().build();
    }
}
