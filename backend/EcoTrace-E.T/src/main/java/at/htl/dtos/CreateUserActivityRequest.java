package at.htl.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateUserActivityRequest {
    @NotBlank(message = "Activity name is required")
    public String activityName;

    @NotBlank(message = "Category is required")
    public String category;

    @NotNull(message = "Quantity is required")
    public Double quantity;

    @NotBlank(message = "Unit is required")
    public String unit;

    public Double co2Impact;
    public Double waterImpact;
    public Double electricityImpact;

    @NotNull(message = "Date is required")
    public LocalDate date;
}
