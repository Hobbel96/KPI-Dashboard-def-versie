const XLSX = require("xlsx");
const path = require("path");

const filepath = path.join(__dirname, "..", "KPI-Dashboard.xlsx");
const workbook = XLSX.readFile(filepath);
const sheet = workbook.Sheets["Weekly Dashboard"];

console.log(`📋 Sheet: Weekly Dashboard\n`);

// Show first 20 rows, first 15 columns
console.log("Content (first 20 rows, all columns with data):");
for (let row = 0; row < 20; row++) {
  const rowLabel = `Row ${row + 1}:`;
  const rowData = [];
  for (let col = 0; col < 20; col++) {
    const cell = XLSX.utils.encode_cell({ r: row, c: col });
    const val = sheet[cell]?.v ?? "";
    if (val || row < 10) { // Show first 10 rows completely
      rowData.push(String(val).substring(0, 12));
    }
  }
  if (rowData.some(v => v)) {
    console.log(`  ${rowLabel.padEnd(10)} ${rowData.join(" | ")}`);
  }
}

console.log("\n\nSpecific rows check:");
console.log("\nRow 3 (should be weeknummers):");
for (let col = 0; col < 45; col++) {
  const cell = XLSX.utils.encode_cell({ r: 2, c: col });
  const val = sheet[cell]?.v;
  if (val && !isNaN(val)) {
    process.stdout.write(` ${val}`);
  }
}
console.log("\n");

console.log("Row 6 (should be bezettingsgraad):");
for (let col = 0; col < 45; col++) {
  const cell = XLSX.utils.encode_cell({ r: 5, c: col });
  const val = sheet[cell]?.v;
  if (val && !isNaN(val)) {
    process.stdout.write(` ${val}`);
  }
}
console.log("\n");
