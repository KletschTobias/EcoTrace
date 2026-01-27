package at.htl.services;

import at.htl.entities.Activity;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.jboss.logging.Logger;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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
     * @param overwrite If true, overwrites existing activities with same name
     * @return ImportResult with statistics
     */
    @Transactional
    public ImportResult importActivities(InputStream inputStream, boolean overwrite) throws Exception {
        ImportResult result = new ImportResult();
        
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
                
                // Check for existing activity
                Activity existing = Activity.findByName(name);
                
                if (existing != null) {
                    if (overwrite) {
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
                    } else {
                        // Duplicate, skip
                        result.duplicateCount++;
                        result.duplicates.add(name);
                    }
                } else {
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
     * Result object for import operation
     */
    public static class ImportResult {
        public int importedCount = 0;
        public int updatedCount = 0;
        public int duplicateCount = 0;
        public int skippedCount = 0;
        public List<String> duplicates = new ArrayList<>();
        public List<String> errors = new ArrayList<>();
        
        public String getMessage() {
            StringBuilder sb = new StringBuilder();
            sb.append("Import completed: ");
            sb.append(importedCount).append(" new, ");
            sb.append(updatedCount).append(" updated, ");
            sb.append(duplicateCount).append(" duplicates skipped, ");
            sb.append(skippedCount).append(" errors");
            return sb.toString();
        }
    }
}
