//----------------------Check_Status_Code ---------------------------------//
Cypress.Commands.add('checkRequestStatus', (url) => {
  let urls;
  cy.request({
    url,
    failOnStatusCode: false,
    rejectUnauthorized: false,
  }).then((response) => {
    const status = response.status;
    if (status !== 200) {
      cy.log(`[Error]: URL ${url} returned status code ${status}`);
      cy.then(() => {
        return url;
      });
    } else {
      cy.then(() => {
        return;
      });
    }
  });
});

//--------------
Cypress.Commands.add('assertion_url', (failed_url) => {
  cy.wrap(failed_urls, { timeout: 1000 }).should('be.empty');
});

//----------------------Capture_Logs---------------------------------//
Cypress.Commands.add('captureLogs', (cyLogsArray) => {
  Cypress.on('log:added', (log) => {
    cyLogsArray.push(log.message);
  });
});

//----------------------Filters_Logs_and_Create_CSV---------------------------------//
Cypress.Commands.add('saveErrorLogs', (cyLogsArray) => {
  const cyLogs = cyLogsArray.join('\n');
  const errorLogs = cyLogs
    .split('\n')
    .filter(
      (log) =>
        (log.includes('[Error]:') || log.includes('but the text was') || log.includes('but got')) &&
        !log.includes('ReferenceError') &&
        !log.includes('www.highcharts.com/errors/16/') &&
        !log.includes('TypeError'),
    );
  const currentTestSuite = Cypress.mocha.getRunner().suite.title;
  const sanitizedTestSuiteName = currentTestSuite.replace(/"/g, '');

  const errorLogFileName = `${sanitizedTestSuiteName}-error-logs.json`;
  const errorLogFilePath = `cypress/logs/${errorLogFileName}`;
  if (errorLogs.length > 0) {
    const errorData = { error: errorLogs };
    cy.writeFile(errorLogFilePath, errorData);
    cy.log('Cypress error logs saved to:', errorLogFilePath);
  } else {
    cy.log('No Cypress error logs present.');
  }
});

//------------------------to handle assertions and log errors without stopping the execution.
Cypress.Commands.add('assertAndContinue', (assertionCallback) => {
  try {
    assertionCallback();
  } catch (err) {
    Cypress.log({
      name: 'Assertion Error',
      message: err.message,
      consoleProps: () => {
        return {
          Error: err
        };
      }
    });
  }
});


