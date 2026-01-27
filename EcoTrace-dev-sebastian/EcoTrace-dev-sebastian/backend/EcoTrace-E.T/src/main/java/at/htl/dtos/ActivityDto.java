package at.htl.dtos;

import at.htl.entities.Activity;

public class ActivityDto {
    public Long id;
    public String name;
    public String category;
    public Double co2PerUnit;
    public Double waterPerUnit;
    public Double electricityPerUnit;
    public String unit;
    public String icon;
    public String description;

    public ActivityDto() {}

    public ActivityDto(Activity activity) {
        this.id = activity.id;
        this.name = activity.name;
        this.category = activity.category;
        this.co2PerUnit = activity.co2PerUnit;
        this.waterPerUnit = activity.waterPerUnit;
        this.electricityPerUnit = activity.electricityPerUnit;
        this.unit = activity.unit;
        this.icon = activity.icon;
        this.description = activity.description;
    }

    public static ActivityDto from(Activity activity) {
        return new ActivityDto(activity);
    }
}
