package at.htl.repositories.consumptionRepository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class YearlyConsumptionRepository implements PanacheRepository<YearlyConsumptionRepository> {
}