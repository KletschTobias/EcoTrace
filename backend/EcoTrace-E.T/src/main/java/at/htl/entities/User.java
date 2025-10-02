package at.htl.entities;

import at.htl.entities.consumptions.*;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class User {

    @Id
    @GeneratedValue
    public Long id;

    public String firstName;
    public String lastName;
    public String email;
    public String userName;

    @OneToMany(fetch = FetchType.LAZY)
    public List<DailyConsumption> userDailyConsumption;

    @OneToMany(fetch = FetchType.LAZY)
    public List<WeeklyConsumption> userWeeklyConsumption;

    @OneToMany(fetch = FetchType.LAZY)
    public List<MonthlyConsumption> userMonthlyConsumption;

    @OneToMany(fetch = FetchType.LAZY)
    public List<YearlyConsumption> userYearlyConsumption;

}