const XLSX = require("xlsx");
const path = require("path");

const filepath = path.join(__dirname, "..", "KPI-Dashboard.xlsx");
const workbook = XLSX.readFile(filepath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

console.log(`📋 Sheet: ${workbook.SheetNames[0]}\n`);

console.log("Row 1:");
for (let col = 0; col < 10; col++) {
  const cell = XLSX.utils.encode_cell({ r: 0, c: col });
  const val = sheet[cell]?.v ?? "";
  process.stdout.write(`  ${String.fromCharCode(65 + col)}: ${val} | `);
}
console.log("\n");

console.log("Row 3 (Weeknummers):");
for (let col = 0; col < 10; col++) {
  const cell = XLSX.utils.encode_cell({ r: 2, c: col });
  const val = sheet[cell]?.v ?? "";
  process.stdout.write(`  ${String.fromCharCode(65 + col)}: ${val} | `);
}
console.log("\n");

console.log("Row 6 (Bezettingsgraad):");
for (let col = 0; col < 10; col++) {
  const cell = XLSX.utils.encode_cell({ r: 5, c: col });
  const val = sheet[cell]?.v ?? "";
  process.stdout.write(`  ${String.fromCharCode(65 + col)}: ${val} | `);
}
console.log("\n");

// Show all rows and first 5 columns
console.log("\nAll rows (first 5 cols):");
for (let row = 0; row < 15; row++) {
  const rowLabel = `Row ${row + 1}:`;
  const rowData = [];
  for (let col = 0; col < 5; col++) {
    const cell = XLSX.utils.encode_cell({ r: row, c: col });
    const val = sheet[cell]?.v ?? "";
    rowData.push(String(val).substring(0, 15));
  }
  console.log(`  ${rowLabel.padEnd(12)} ${rowData.join(" | ")}`);
}
