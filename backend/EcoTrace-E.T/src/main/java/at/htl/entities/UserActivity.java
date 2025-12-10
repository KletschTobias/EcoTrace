package at.htl.entities;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activities")
public class UserActivity extends PanacheEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @NotBlank(message = "Activity name is required")
    @Column(name = "activity_name", nullable = false)
    public String activityName;

    @NotBlank(message = "Category is required")
    @Column(nullable = false)
    public String category;

    @NotNull(message = "Quantity is required")
    @Column(nullable = false)
    public Double quantity;

    @NotBlank(message = "Unit is required")
    @Column(nullable = false)
    public String unit;

    @Column(name = "co2_impact")
    public Double co2Impact = 0.0;

    @Column(name = "water_impact")
    public Double waterImpact = 0.0;

    @Column(name = "electricity_impact")
    public Double electricityImpact = 0.0;

    @NotNull(message = "Date is required")
    @Column(nullable = false)
    public LocalDate date;

    @Column(name = "created_date")
    public LocalDateTime createdDate;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
    }

    // Static methods for queries
    public static long countByUserId(Long userId) {
        return count("user.id", userId);
    }
}
