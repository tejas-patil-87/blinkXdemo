Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
let cyLogsArray = [];
let failed_urls = [];
before(() => {
  cy.captureLogs(cyLogsArray);
});

describe('Company Page URLs', () => {
  let companyNameList = [];
  before(() => {
    cy.fixture('companyNameList.json').then((data) => {
      companyNameList = data;
    });
  });

  it('Check status code of URLs', () => {
    companyNameList.forEach((company) => {
      cy.checkRequestStatus(company.url+'-financials').then((failedUrl) => {
        if (failedUrl == null) {
          return;
        } else {
          failed_urls.push(failedUrl);
        }
      });
    });
    cy.then(() => {
      cy.wrap(failed_urls, { timeout: 0 }).should('be.empty');
    });
  });
  after(() => {
    cy.saveErrorLogs(cyLogsArray);
  });
});
