package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "achievements")
public class Achievement extends PanacheEntity {

    @NotBlank(message = "Name is required")
    @Column(unique = true, nullable = false)
    public String name;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, length = 500)
    public String description;

    @NotBlank(message = "Icon is required")
    @Column(nullable = false)
    public String icon; // Emoji or icon name

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    public String category; // ACTIVITY, CO2_REDUCTION, STREAK, SOCIAL, MILESTONE

    @NotNull(message = "Target value is required")
    @Column(name = "target_value", nullable = false)
    public Integer targetValue; // e.g., 10 activities, 100 kg CO2 saved, 7 day streak

    @NotBlank(message = "Target type is required")
    @Column(name = "target_type", nullable = false)
    public String targetType; // ACTIVITY_COUNT, CO2_SAVED, DAYS_STREAK, FRIENDS_COUNT, SPECIFIC_ACTIVITY

    @Column(name = "specific_activity")
    public String specificActivity; // For SPECIFIC_ACTIVITY type (e.g., "Cycling", "Vegan Meal")

    @NotBlank(message = "Badge color is required")
    @Column(name = "badge_color", nullable = false)
    public String badgeColor; // CSS color for badge background

    @NotNull(message = "Points are required")
    @Column(nullable = false)
    public Integer points = 10; // Points awarded for this achievement

    // Static finder methods
    public static Achievement findByName(String name) {
        return find("name", name).firstResult();
    }
}
