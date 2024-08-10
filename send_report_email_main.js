const fs = require('fs');
const nodemailer = require('nodemailer');
const emailConfig = require('./emailConfig.json');
const { createWriteStream } = require('fs');
const { createGzip } = require('zlib');
const path = require('path');
const archiver = require('archiver');

const jsonReportfilePath = 'cypress/reports/blinkx-report.json';
const htmlTable = generateHTMLTable(jsonReportfilePath);
const screenshotDir = 'cypress/screenshots';
const mergedReportPath = 'cypress/reports/blinkx-report.html';
const zipFilePath = 'cypress/reports/screenshots.zip';
const csvFilePath = 'cypress/logs/errorFinalReport.csv';

const transporter = nodemailer.createTransport(emailConfig.transporter);

function createZipFile(inputFolder, outputFile) {
  const output = fs.createWriteStream(outputFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  output.on('end', function () {
    console.log('Data has been drained');
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(inputFolder, false);

  archive.finalize();
}

createZipFile(screenshotDir, zipFilePath);

function getTodaysDate() {
  const date = new Date();
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

function fetchUAT(jsonContent) {
  for (const result of jsonContent.results) {
    if (result && result.suites && result.suites.length > 0 && result.suites[0].suites && result.suites[0].suites.length > 0) {
      const title = result.suites[0].suites[0].title.toLowerCase();
      if (title.includes('uat')) {
        return 'UAT';
      } else if (title.includes('beta')) {
        return 'Beta';
      }
    }
  }
  return 'Production';
}

fs.readFile(jsonReportfilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
  } catch (error) {
    console.error('Error parsing JSON:', error);
  } finally {
    const jsonContent = JSON.parse(data);
    uat = fetchUAT(jsonContent);
    sendEmail(uat);
  }
});

function generateHTMLTable(jsonReportfilePath) {
  try {
    const rawData = fs.readFileSync(jsonReportfilePath);
    const jsonData = JSON.parse(rawData);
    if (jsonData.stats) {
      const stats = jsonData.stats;
      const suites = stats.suites || 0;
      const tests = stats.tests || 0;
      const passes = stats.passes || 0;
      const pending = stats.pending || 0;
      const failures = stats.failures || 0;
      const testsRegistered = stats.testsRegistered || 0;
      const passPercent = (Math.floor(stats.passPercent * 100) / 100).toFixed(2) || 0;
      const pendingPercent = stats.pendingPercent || 0;
      const skipped = stats.skipped || 0;
      const htmlTable = ` 
    <div style="font-family: 'Arial', sans-serif; color: #333; text-align: center;">
    <h1 style="color: #2ecc71;">Automated Test Script Report</h1>
    <p style="font-size: 14px; text-align: left;">I hope this email finds you well. Attached herewith is the automated test script report for the Blinkx as of ${getTodaysDate()}.</p>
    <p style="font-size: 14px; text-align: left;">The report includes a comprehensive overview of the test execution, identified issues, and overall test coverage.</p>
    <div style="font-family: 'Arial', sans-serif; color: #333; margin: 20px auto; text-align: center;">
    <h2 style="color: #3498db; text-align: center;">Test Summary</h2>

                <table style="width: 60%; border-collapse: collapse; margin: 10px auto; border: 1px solid #ddd;">
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Number of Test Suites</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${suites}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Number of Total Test CasesTests</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${tests}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Number of Passed Test Cases</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${passes}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Number of Pending Test Cases</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${pending}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Number of Failures Test Cases</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${failures}</td>
                    </tr>
                  
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Test Cases Passing Percent</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${passPercent}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Test Cases Pending Percent</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${pendingPercent}</td>
                    </tr>
                    <tr>
                        <td style="background-color: #f2f2f2; color: #333; padding: 10px; border: 1px solid #ddd;">Number of Skipped Test Cases</td>
                        <td style="background-color: #e6f7ff; padding: 10px; border: 1px solid #ddd;">${skipped}</td>
                    </tr>
                </table>
        <p style="font-size: 16px; text-align: left;">For detailed information, please refer to the attached merged HTML report.</p>
        <p style="font-size: 16px; color: #b5b3b3; text-align: left;">Best Regards,<br><span style="font-size: 16px; color: #000; text-align: left;" >Tejas Patil</span></p>
      </div>
</div>`;
      return htmlTable;
    } else {
      console.error('Error: "stats" property not found in the JSON file.');
      return null;
    }
  } catch (error) {
    console.error('Error reading or parsing the JSON file:', error.message);
    return null;
  }
}

function sendEmail(uat) {
  const mailOptions = {
    from: emailConfig.senderEmailAddresser,
    to: emailConfig.recipientEmailAddresser,
    cc: emailConfig.ccList,
    subject: `${emailConfig.subject}${uat} ${getTodaysDate()}`,
    html: htmlTable,
    attachments: [
      {
        filename: 'blinkx-report.html',
        content: fs.readFileSync(mergedReportPath, 'utf-8'),
      },
    ],
  };

  if (fs.existsSync(screenshotDir) && fs.existsSync(mergedReportPath)) {
    mailOptions.attachments.push(
      {
        filename: 'screenshots.zip',
        path: zipFilePath,
      },
      {
        filename: 'errorFinalReport.csv',
        path: csvFilePath,
      },
    );
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}
