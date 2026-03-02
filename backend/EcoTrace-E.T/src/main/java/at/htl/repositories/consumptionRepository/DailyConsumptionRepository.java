package at.htl.repositories.consumptionRepository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DailyConsumptionRepository implements PanacheRepository<DailyConsumptionRepository> {
}