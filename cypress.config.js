// In cypress/plugins/index.js
const fs = require('fs');

module.exports = (on, config) => {
  on('task', {
    logToTextFile(message) {
      fs.appendFileSync('console.log', `${message}\n`);
      return null; // Return null to indicate task completion
    },
  });
};

module.exports = (on, config) => {
  /** the rest of your plugins... **/
  const options = { recordLogs: true };
  require('cypress-log-to-output').install(on, filterCallback, options);
};

module.exports = {
  projectId: '2ibe68',
  e2e: {
    setupNodeEvents(on, config) {},
    experimentalRunAllSpecs: true,
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
  env: {
    UAT: 'uat.',
    baseUrl: 'blinkx.in',
  },

  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports/mochawesome',
    overwrite: false,
    html: false,
    json: true,
    charts: true,
  },
  video: false,

  // retries: {
  //   runMode: 2,
  //   openMode: 1,
  // },

  // webview
  viewportWidth: 1366,
  viewportHeight: 768,

  chromeWebSecurity: false,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 3000000,

  // "pageLoadTimeout": 30000, // Set the value to 30000 milliseconds (30 seconds) or adjust as needed
};
