package at.htl.services;

import at.htl.dtos.ActivityDto;
import at.htl.entities.Activity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ActivityService {

    public List<ActivityDto> getAllActivities() {
        return Activity.<Activity>listAll().stream()
                .map(ActivityDto::from)
                .collect(Collectors.toList());
    }

    public ActivityDto getActivityById(Long id) {
        Activity activity = Activity.findById(id);
        if (activity == null) {
            throw new NotFoundException("Activity not found");
        }
        return ActivityDto.from(activity);
    }

    public List<ActivityDto> getActivitiesByCategory(String category) {
        return Activity.<Activity>list("category", category).stream()
                .map(ActivityDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ActivityDto createActivity(ActivityDto activityDto) {
        Activity activity = new Activity();
        activity.name = activityDto.name;
        activity.category = activityDto.category;
        activity.co2PerUnit = activityDto.co2PerUnit;
        activity.waterPerUnit = activityDto.waterPerUnit;
        activity.electricityPerUnit = activityDto.electricityPerUnit;
        activity.unit = activityDto.unit;
        activity.icon = activityDto.icon;
        activity.description = activityDto.description;
        activity.persist();

        return ActivityDto.from(activity);
    }

    @Transactional
    public void deleteActivity(Long id) {
        Activity activity = Activity.findById(id);
        if (activity == null) {
            throw new NotFoundException("Activity not found");
        }
        activity.delete();
    }
}
