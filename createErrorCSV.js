const fs = require('fs');
const path = require('path');

function combineJsonFiles(folderPath, outputFile) {
  const outputFilePath = path.join(folderPath, outputFile);

  if (fs.existsSync(outputFilePath)) {
    console.log('Output file already exists. Skipping merge.');
    return;
  }

  let allErrors = {};
  let serialNo = 1;

  fs.readdirSync(folderPath).forEach((file) => {
    if (file.endsWith('.json')) {
      let filePath = path.join(folderPath, file);
      let jsonData;
      try {
        jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (err) {
        console.error(`Error parsing JSON file ${file}:`, err);
        return;
      }
      if (jsonData && jsonData.error && Array.isArray(jsonData.error)) {
        for (let error of jsonData.error) {
          const cleanedError = error.replace(/^\[Error\]:\s*/, '');
          if (!allErrors[cleanedError]) {
            allErrors[cleanedError] = serialNo++;
          }
        }
      } else {
        console.error(`Invalid JSON format in file ${file}.`);
      }
    }
  });

  // Write to CSV file
  let csvContent = 'Serial No,Error\n';
  for (let error in allErrors) {
    csvContent += `${allErrors[error]},"${error.replace(/"/g, '""')}"\n`;
  }

  fs.writeFileSync(outputFilePath, csvContent);
  console.log(`CSV file successfully generated at ${outputFilePath}`);
}

const folderPath = 'cypress/logs';
const outputFile = 'errorFinalReport.csv';
combineJsonFiles(folderPath, outputFile);
