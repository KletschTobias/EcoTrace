package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "activities")
public class Activity extends PanacheEntity {

    @NotBlank(message = "Activity name is required")
    @Column(nullable = false)
    public String name;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    public String category; // transport, home, food, shopping, other

    @Column(name = "co2_per_unit")
    public Double co2PerUnit = 0.0;

    @Column(name = "water_per_unit")
    public Double waterPerUnit = 0.0;

    @Column(name = "electricity_per_unit")
    public Double electricityPerUnit = 0.0;

    @NotBlank(message = "Unit is required")
    @Column(nullable = false)
    public String unit; // km, minutes, times, etc.

    public String icon;

    public String description;

    // Static method for finding by category
    public static Activity findByName(String name) {
        return find("name", name).firstResult();
    }
}
