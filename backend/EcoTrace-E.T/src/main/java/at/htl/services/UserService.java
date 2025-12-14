package at.htl.services;

import at.htl.repositories.UserRepository;
import at.htl.dtos.UserDto;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;

@Path("/users")
public class UserService {

    @Inject
    UserRepository userRepository;

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    public String hello() {
        return "Hello RESTEasy";
    }

    @GET()
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public UserDto getUserInformation(@PathParam("id") Long id) {
        return userRepository.getUserInformation(id);
    }

    @GET()
    @Path("/{id}/daily/{date}")
    @Produces(MediaType.APPLICATION_JSON)
    public UserDto getUserConsumptionDaily(@PathParam("id") Long id,
                                           @PathParam("date") LocalDate date) {
        return userRepository.getUserInformation(id);
    }

    @GET()
    @Path("/{id}/weekly/{calenderweek}")
    @Produces(MediaType.APPLICATION_JSON)
    public UserDto getUserConsumptionWeekly(@PathParam("id") Long id,
                                            @PathParam("calenderweek") int calenderweek) {
        return userRepository.getUserInformation(id);
    }

    @GET()
    @Path("/{id}/monthly/{month}")
    @Produces(MediaType.APPLICATION_JSON)
    public UserDto getUserConsumptionMonthly(@PathParam("id") Long id,
                                             @PathParam("month") int month) {
        return userRepository.getUserInformation(id);
    }

    @GET()
    @Path("/{id}/yearly/{year}")
    @Produces(MediaType.APPLICATION_JSON)
    public UserDto getUserConsumptionYearly(@PathParam("id") Long id,
                                            @PathParam("year") int year) {
        return userRepository.getUserInformation(id);
    }

    @POST
    @Path("/{id}/daily/{daily}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response.Status postConsumptionDaily() {
        return Response.Status.NO_CONTENT;
    }


    @POST
    @Path("/{id}/weekly/{weekly}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response.Status postConsumptionWeekly() {
        return Response.Status.NO_CONTENT;
    }

    @POST
    @Path("/{id}/monthly/{month}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response.Status postConsumptionMonthly() {
        return Response.Status.NO_CONTENT;
    }

    @POST
    @Path("/{id}/yearly/{year}")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response.Status postConsumptionYearly() {
        return Response.Status.NO_CONTENT;
    }
}
