Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
let cyLogsArray = [];

before(() => {
  cy.captureLogs(cyLogsArray);
});
describe('Check robot.txt', () => {
  let user;

  let urlForRobot = `https://${Cypress.env('UAT')}blinkx.in/robots.txt`;

  it('check robot.txt file', () => {
    const robotExpectedUrl = require('../fixtures/robotExpectedUrl.json');
    cy.request({ url: `https://${Cypress.env('UAT')}blinkx.in/robots.txt`, failOnStatusCode: false }).then((response) => {
      if (response.status !== 200) {
        cy.log(`[Error]: robot.txt have ${response.status} response code`);
        expect(response.status).to.equal(200);
      }
      expect(response.headers['content-type']).to.include('text/plain');
      if (urlForRobot.includes('uat') || urlForRobot.includes('beta')) {
        expect(response.body).to.include('User-agent: *');
        const lines = response.body.split('\n').map((line) => line.trim());
        expect(lines).to.have.lengthOf(2);
        expect(lines[1]).to.equal('Disallow: /');
      } else {
        const responseLinks = response.body
          .split('\n')
          .filter((line) => line.startsWith('Sitemap: '))
          .map((line) => line.replace('Sitemap: ', '').trim());

        robotExpectedUrl.forEach((link) => {
          expect(responseLinks).to.include(link);
        });

        const additionalLinks = responseLinks.filter((link) => !robotExpectedUrl.includes(link));

        if (additionalLinks.length > 0) {
          additionalLinks.forEach((item) => cy.log(`[Error]: In Production ENV, ${item} URL is not present robot.txt`));
          cy.wrap(additionalLinks, { timeout: 1000 }).should('be.empty');
        }
      }
    });
  });
});

after(() => {
  cy.saveErrorLogs(cyLogsArray);
});
