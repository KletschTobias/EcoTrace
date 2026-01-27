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
    
    // Recurring activity fields
    @Column(name = "is_recurring")
    public Boolean isRecurring = false;
    
    @Column(name = "times_per_week")
    public Integer timesPerWeek;
    
    @Column(name = "weeks_per_year")
    public Integer weeksPerYear = 52;

    @PrePersist
    public void prePersist() {
        this.createdDate = LocalDateTime.now();
    }
    
    /**
     * Calculate the total impact multiplier based on recurring settings
     * @return multiplier for total impact calculation (timesPerWeek * weeksPerYear), or 1 if not recurring
     */
    public int getRecurringMultiplier() {
        if (isRecurring != null && isRecurring && timesPerWeek != null && weeksPerYear != null) {
            return timesPerWeek * weeksPerYear;
        }
        return 1;
    }
    
    /**
     * Get total CO2 impact including recurring multiplier
     */
    public Double getTotalCo2Impact() {
        return co2Impact != null ? co2Impact * getRecurringMultiplier() : 0.0;
    }
    
    /**
     * Get total water impact including recurring multiplier
     */
    public Double getTotalWaterImpact() {
        return waterImpact != null ? waterImpact * getRecurringMultiplier() : 0.0;
    }
    
    /**
     * Get total electricity impact including recurring multiplier
     */
    public Double getTotalElectricityImpact() {
        return electricityImpact != null ? electricityImpact * getRecurringMultiplier() : 0.0;
    }

    // Static methods for queries
    public static long countByUserId(Long userId) {
        return count("user.id", userId);
    }
}
