package at.htl.services;

import at.htl.entities.Activity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.jboss.logging.Logger;

import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for importing and exporting activities via Excel files
 */
@ApplicationScoped
public class ActivityImportExportService {

    private static final Logger LOG = Logger.getLogger(ActivityImportExportService.class);

    // Column headers for Excel export
    private static final String[] HEADERS = {
        "Name", "Category", "CO2 per Unit", "Water per Unit", 
        "Electricity per Unit", "Unit", "Icon", "Description"
    };

    /**
     * Export all activities to Excel format
     */
    public byte[] exportActivities() throws Exception {
        List<Activity> activities = Activity.listAll();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Activities");
            
            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < HEADERS.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(HEADERS[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (Activity activity : activities) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(activity.name);
                row.createCell(1).setCellValue(activity.category);
                row.createCell(2).setCellValue(activity.co2PerUnit != null ? activity.co2PerUnit : 0.0);
                row.createCell(3).setCellValue(activity.waterPerUnit != null ? activity.waterPerUnit : 0.0);
                row.createCell(4).setCellValue(activity.electricityPerUnit != null ? activity.electricityPerUnit : 0.0);
                row.createCell(5).setCellValue(activity.unit);
                row.createCell(6).setCellValue(activity.icon != null ? activity.icon : "");
                row.createCell(7).setCellValue(activity.description != null ? activity.description : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Import activities from Excel file
     * @param inputStream Excel file input stream
     * @param syncMode If true, deletes all existing activities first (full sync)
     * @return ImportResult with statistics
     */
    @Transactional
    public ImportResult importActivities(InputStream inputStream, boolean syncMode) throws Exception {
        ImportResult result = new ImportResult();
        
        // If sync mode: delete all existing activities first
        if (syncMode) {
            long deletedCount = Activity.deleteAll();
            result.deletedCount = (int) deletedCount;
            LOG.info("Sync mode: Deleted " + deletedCount + " existing activities");
        }
        
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Skip header row
            boolean isFirstRow = true;
            for (Row row : sheet) {
                if (isFirstRow) {
                    isFirstRow = false;
                    continue;
                }
                
                // Skip empty rows
                if (row.getCell(0) == null || getCellStringValue(row.getCell(0)).isEmpty()) {
                    continue;
                }
                
                // Read row data
                String name = getCellStringValue(row.getCell(0));
                String category = getCellStringValue(row.getCell(1));
                Double co2PerUnit = getCellNumericValue(row.getCell(2));
                Double waterPerUnit = getCellNumericValue(row.getCell(3));
                Double electricityPerUnit = getCellNumericValue(row.getCell(4));
                String unit = getCellStringValue(row.getCell(5));
                String icon = getCellStringValue(row.getCell(6));
                String description = getCellStringValue(row.getCell(7));
                
                // Validate required fields
                if (name.isEmpty() || category.isEmpty() || unit.isEmpty()) {
                    result.skippedCount++;
                    result.errors.add("Row " + (row.getRowNum() + 1) + ": Missing required fields (name, category, or unit)");
                    continue;
                }
                
                // In sync mode, always create new. Otherwise check for existing
                if (!syncMode) {
                    Activity existing = Activity.findByName(name);
                    if (existing != null) {
                        // Update existing activity
                        existing.category = category;
                        existing.co2PerUnit = co2PerUnit;
                        existing.waterPerUnit = waterPerUnit;
                        existing.electricityPerUnit = electricityPerUnit;
                        existing.unit = unit;
                        existing.icon = icon;
                        existing.description = description;
                        existing.persist();
                        result.updatedCount++;
                        LOG.info("Updated activity: " + name);
                        continue;
                    }
                }
                
                // Create new activity
                Activity newActivity = new Activity();
                newActivity.name = name;
                newActivity.category = category;
                newActivity.co2PerUnit = co2PerUnit;
                newActivity.waterPerUnit = waterPerUnit;
                newActivity.electricityPerUnit = electricityPerUnit;
                newActivity.unit = unit;
                newActivity.icon = icon;
                newActivity.description = description;
                newActivity.persist();
                result.importedCount++;
                LOG.info("Imported new activity: " + name);
            }
        }
        
        return result;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }

    private Double getCellNumericValue(Cell cell) {
        if (cell == null) return 0.0;
        
        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    return Double.parseDouble(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            default:
                return 0.0;
        }
    }

    /**
     * Sync import.sql file with current database state
     * Automatically updates the activities section in import.sql
     */
    @Transactional
    public void syncImportSql() {
        try {
            // Path to import.sql
            Path importSqlPath = Paths.get("src/main/resources/import.sql");
            
            if (!Files.exists(importSqlPath)) {
                LOG.warn("import.sql file not found at: " + importSqlPath.toAbsolutePath());
                return;
            }
            
            // Read current import.sql
            String content = Files.readString(importSqlPath);
            
            // Generate new activities SQL
            String newActivitiesSql = generateActivitiesSql();
            
            // Find and replace activities section
            String updatedContent = replaceActivitiesSection(content, newActivitiesSql);
            
            // Write back to file
            Files.writeString(importSqlPath, updatedContent);
            
            LOG.info("✅ import.sql synchronized successfully!");
            
        } catch (IOException e) {
            LOG.error("Failed to sync import.sql: " + e.getMessage(), e);
        }
    }

    /**
     * Generate SQL INSERT statements for all activities
     */
    private String generateActivitiesSql() {
        List<Activity> activities = Activity.listAll();
        StringBuilder sql = new StringBuilder();
        
        sql.append("-- Predefined Activities\n");
        sql.append("INSERT INTO activities (id, name, category, co2_per_unit, water_per_unit, electricity_per_unit, unit, icon, description) VALUES\n");
        
        for (int i = 0; i < activities.size(); i++) {
            Activity a = activities.get(i);
            sql.append(String.format("(nextval('activities_seq'), '%s', '%s', %.1f, %.1f, %.1f, '%s', '%s', '%s')",
                a.name.replace("'", "''"),
                a.category,
                a.co2PerUnit != null ? a.co2PerUnit : 0.0,
                a.waterPerUnit != null ? a.waterPerUnit : 0.0,
                a.electricityPerUnit != null ? a.electricityPerUnit : 0.0,
                a.unit,
                a.icon != null ? a.icon : "",
                a.description != null ? a.description.replace("'", "''") : ""));
            
            if (i < activities.size() - 1) {
                sql.append(",\n");
            } else {
                sql.append(";\n");
            }
        }
        
        return sql.toString();
    }

    /**
     * Replace activities section in import.sql content
     */
    private String replaceActivitiesSection(String content, String newActivitiesSql) {
        // Pattern to match activities section (from "-- Predefined Activities" to before "-- Demo Users" or "-- New CSV activities" or end)
        String startMarker = "-- Predefined Activities";
        String endMarker = "-- Demo Users";
        
        int startIdx = content.indexOf(startMarker);
        if (startIdx == -1) {
            // Fallback: look for old marker
            startMarker = "-- Activities";
            startIdx = content.indexOf(startMarker);
        }
        
        int endIdx = content.indexOf(endMarker, startIdx);
        
        if (startIdx != -1 && endIdx != -1) {
            // Replace the section
            return content.substring(0, startIdx) + newActivitiesSql + "\n" + content.substring(endIdx);
        } else if (startIdx != -1) {
            // Only start marker found, replace till end
            return content.substring(0, startIdx) + newActivitiesSql;
        } else {
            LOG.warn("Could not find activities section markers in import.sql");
            return content;
        }
    }

    /**
     * Generate import.sql INSERT statements from current database
     */
    public String generateImportSql() {
        return generateActivitiesSql();
    }

    /**
     * Result object for import operation
     */
    public static class ImportResult {
        public int importedCount = 0;
        public int updatedCount = 0;
        public int duplicateCount = 0;
        public int skippedCount = 0;
        public int deletedCount = 0;
        public List<String> duplicates = new ArrayList<>();
        public List<String> errors = new ArrayList<>();
        
        public String getMessage() {
            StringBuilder sb = new StringBuilder();
            sb.append("Import completed: ");
            if (deletedCount > 0) {
                sb.append(deletedCount).append(" deleted, ");
            }
            sb.append(importedCount).append(" new, ");
            sb.append(updatedCount).append(" updated, ");
            sb.append(duplicateCount).append(" duplicates skipped, ");
            sb.append(skippedCount).append(" errors");
            return sb.toString();
        }
    }
}
