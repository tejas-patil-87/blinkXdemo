// Function to parse XML string to Document
function parseXML(xmlString) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'application/xml');
}

const environments = [{ name: `${Cypress.env('UAT')}`, domain: `${Cypress.env('UAT')}` }];
let cyLogsArray = [];

before(() => {
  cy.captureLogs(cyLogsArray);
});
let failed_urls = [];
describe('Check Sitemap and URL', () => {
  environments.forEach((env) => {
    const urlForSiteMap = require('../fixtures/siteMapExpectedUrl.json');
    let unexpectedUrls = [];
    it('check sitemap XML and URLs', () => {
      cy.request({
        method: 'GET',
        url: `https://${env.domain}blinkx.in/sitemap-index.xml`,
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status !== 200) {
          cy.log(`[Error]: sitemap has ${response.status} response code on ${Cypress.env('UAT')} ENV`);
          //expect(response.status).to.equal(200);
        }
        cy.then(() => {
          const xml = parseXML(response.body);

          const unexpectedUrls = [];

          urlForSiteMap.forEach((url) => {
            const urlElements = Array.from(xml.querySelectorAll('url loc')).map((element) => element.textContent.trim());
            expect(urlElements).to.include(url, `URL: ${url} should be present in the XML`);
            expect(response.body.includes(url), `URL: ${url} should be present in the response`).to.be.true;
          });

          Array.from(xml.querySelectorAll('url loc')).forEach((element) => {
            const url = element.textContent.trim();
            if (!urlForSiteMap.includes(url)) {
              unexpectedUrls.push(url);
            }
          });

          if (unexpectedUrls.length > 0) {
            unexpectedUrls.forEach((item) => cy.log(`[Error]:In ${env.name} ENV, ${item} URL is not present in Sitemap`));
            cy.wrap(unexpectedUrls, { timeout: 1000 }).should('be.empty');
          }
        });
      });
    });
    // it('option chain', () => {
    //   cy.request({
    //     method: 'GET',
    //     url: `https://${env.domain}blinkx.in/option-chain-sitemap.xml`,
    //     failOnStatusCode: false,
    //   }).then((response) => {
    //     if (response.status !== 200) {
    //       cy.log(`[Error]: sitemap has ${response.status} response code on ${Cypress.env('UAT')} ENV`);
    //     }
    //     cy.then(() => {
    //       const xml = parseXML(response.body);

    //       const unexpectedUrls = [];

    //       const urlElements = Array.from(xml.querySelectorAll('url loc')).map((element) => element.textContent.trim());

    //       var modifiedLinks = urlElements.map(function (link) {
    //         return `${env.domain}` + link.substr(8);
    //       });

    //       modifiedLinks.forEach((url) => {
    //         cy.checkRequestStatus(url).then((failedUrl) => {
    //           if (failedUrl == null) {
    //             return;
    //           } else {
    //             failed_urls.push(failedUrl);
    //           }
    //         });
    //       });
    //       cy.then(() => {
    //         cy.wrap(failed_urls, { timeout: 0 }).should('be.empty');
    //       });
    //     });
    //   });
    // });
  });
  afterEach(() => {
    cy.saveErrorLogs(cyLogsArray);
  });
});
