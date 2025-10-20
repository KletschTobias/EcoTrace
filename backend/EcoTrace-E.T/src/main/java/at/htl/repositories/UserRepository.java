package at.htl.repositories;

import at.htl.repositories.consumptionRepository.DailyConsumptionRepository;
import at.htl.repositories.consumptionRepository.MonthlyConsumptionRepository;
import at.htl.repositories.consumptionRepository.WeeklyConsumptionRepository;
import at.htl.repositories.consumptionRepository.YearlyConsumptionRepository;
import at.htl.dtos.UserDto;
import at.htl.entities.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {

    @Inject
    UserRepository userRepository;

    @Inject
    DailyConsumptionRepository dailyConsumptionRepository;

    @Inject
    WeeklyConsumptionRepository weeklyConsumptionRepository;

    @Inject
    MonthlyConsumptionRepository monthlyConsumptionRepository;

    @Inject
    YearlyConsumptionRepository yearlyConsumptionRepository;

    public UserDto getUserInformation(Long id){
        User user = userRepository.findById(id);
        return new UserDto(user);
    }

}
