// Script to merge Excel and CSV data, removing duplicates
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Load existing Excel data
console.log('Loading Excel data...');
const excelPath = path.join(__dirname, '../docs/scrap_9_12_2025.xlsx');
const excelWorkbook = XLSX.readFile(excelPath);
const excelSheet = excelWorkbook.Sheets[excelWorkbook.SheetNames[0]];
const excelData = XLSX.utils.sheet_to_json(excelSheet);
console.log(`Excel: ${excelData.length} records`);

// Load new CSV data
console.log('Loading CSV data...');
const csvPath = path.join(__dirname, '../docs/plastic-injection-molding-service-in-jakarta-jakarta-raya-indonesia.csv');
const csvWorkbook = XLSX.readFile(csvPath);
const csvSheet = csvWorkbook.Sheets[csvWorkbook.SheetNames[0]];
const csvData = XLSX.utils.sheet_to_json(csvSheet);
console.log(`CSV: ${csvData.length} records`);

// Normalize CSV data to match Excel structure
function normalizeCSVRecord(record) {
    return {
        place_id: record.place_id || record.id,
        name: record.name || record.title,
        description: record.description,
        reviews: parseInt(record.reviews) || parseInt(record.reviews_count) || 0,
        rating: parseFloat(record.rating) || parseFloat(record.total_score) || 0,
        phone: record.phone || record.phone_number,
        website: record.website || record.site,
        main_category: record.main_category || record.category || record.type,
        categories: record.categories || record.category,
        address: record.address || record.full_address,
        link: record.link || record.google_maps_url,
        query: record.query || 'plastic injection molding service',
        workday_timing: record.working_hours || record.workday_timing,
        closed_on: record.closed_on,
        featured_image: record.featured_image || record.main_photo,
        owner_name: record.owner_name
    };
}

// Normalize CSV records
const normalizedCSV = csvData.map(normalizeCSVRecord);

// Merge and deduplicate by place_id and name
const existingPlaceIds = new Set(excelData.map(r => r.place_id));
const existingNames = new Set(excelData.map(r => r.name?.toLowerCase().trim()));

let newRecords = 0;
let duplicates = 0;

normalizedCSV.forEach(record => {
    const placeId = record.place_id;
    const name = record.name?.toLowerCase().trim();

    // Check for duplicates by place_id or name
    if (existingPlaceIds.has(placeId) || existingNames.has(name)) {
        duplicates++;
        return;
    }

    // Add to dataset
    excelData.push(record);
    existingPlaceIds.add(placeId);
    existingNames.add(name);
    newRecords++;
});

console.log(`\n=== Merge Results ===`);
console.log(`Original records: ${excelData.length - newRecords}`);
console.log(`New records added: ${newRecords}`);
console.log(`Duplicates skipped: ${duplicates}`);
console.log(`Total records: ${excelData.length}`);

// Save merged data
const outputPath = path.join(__dirname, '../docs/scraped_data.json');
fs.writeFileSync(outputPath, JSON.stringify(excelData, null, 2));
console.log(`\nSaved to: ${outputPath}`);
