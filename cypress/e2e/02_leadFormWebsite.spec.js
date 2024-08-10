Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('lead Form Scenario', () => {
  const urlsToTest = require('../fixtures/urlsToTest.json');
  urlsToTest.forEach((urlsToTest) => {
    let user;

    context(`Testing on URL: ${Cypress.env('UAT')}${urlsToTest}`, () => {
      beforeEach(() => {
        cy.visit('https://' + Cypress.env('UAT') + urlsToTest);
        cy.fixture('footerDetails').then((userData) => {
          user = userData;
        });
      });

      it('lead form', () => {
        cy.url().then((url) => {
          const getURL = url;
          const splitSegments = getURL.split('/');
          cy.log('Split segments:', splitSegments);
          cy.log(JSON.stringify(splitSegments));

          if (
            getURL.includes('/open-demat-account') ||
            getURL.includes('/intraday-stocks') ||
            getURL.includes('/stock-market-holidays') ||
            getURL.includes('/indices') ||
            getURL.includes('/breakout-stocks') ||
            (getURL.includes('/en/knowledge-base/') && splitSegments.length === 7 && !getURL.endsWith('/en/knowledge-base/')) ||
            (getURL.includes('/blogs/') && splitSegments.length === 5) ||
            getURL.includes('/stocks')
          ) {
            cy.get('.form-footer').should('exist');
            cy.get('.form-footer a').should('have.attr', 'href', '/assets/pdf/Final-terms-for-DIY-account-opening.pdf').and('have.attr', 'target', '_blank');

            // .and('contain.text', 'terms & conditions');
            cy.get("input[placeholder='10-Digit Mobile Number']").type('9004300384', { force: true });

            cy.get('.form-card.leadform50-kc').find('.btn.common-btn').click({ force: true });

            //const expectedUrl = 'https://signup.blinkx.in/diy/verify-mobile';
            cy.get('.get-started-img-wrap').should('exist').should('be.visible');
            cy.url().should('include', 'diy/verify-mobile');

            cy.get('#txtMobile', { timeout: 0 }).should('exist');
          } else if (getURL.includes('/trading-app') || getURL.includes('/stock-market-companies-list')) {
            cy.log('No lead form on this page');
          } else if (getURL.includes('/current-ipo') || getURL.includes('/upcoming-ipo') || getURL.includes('/closed-ipo')) {
            cy.get('.form-footer').should('exist');
            cy.get('.form-footer a').should('have.attr', 'href', '/assets/pdf/Final-terms-for-DIY-account-opening.pdf').and('have.attr', 'target', '_blank');

            // .and('contain.text', 'terms & conditions');
            cy.get("input[placeholder='10-Digit Mobile Number']").type('9004300384', { force: true });

            cy.get("form[class='ng-untouched ng-pristine ng-valid']").find('.btn.common-btn').click({ force: true });
            //const expectedUrl = 'https://signup.blinkx.in/diy/verify-mobile';
            cy.get('.get-started-img-wrap').should('exist').should('be.visible');
            cy.url().should('include', 'diy/verify-mobile');

            cy.get('#txtMobile', { timeout: 0 }).should('exist');
          } else {
            let count;
            let currentIndex = 0;
            cy.get('.input-group-wrap')
              .its('length')
              .then((c) => {
                count = c;
                cy.log(`Total elements with class '.input-group-wrap': ${count}`);
                cy.wrap('.input-group-wrap').as('inputGroupWrapElements');
              });

            cy.get('@inputGroupWrapElements')
              .should('have.length.above', 0)
              .then(() => {
                cy.get('.input-group-wrap')
                  .find('[id^="txtMobile_"]')
                  .each(($element) => {
                    if (currentIndex > 0) {
                      cy.visit('https://' + Cypress.env('UAT') + urlsToTest);
                    }

                    const lastDigit = $element.attr('id').slice(-1);
                    const newMobileId = `txtMobile_${lastDigit}`;
                    const newMobileNumber = `#${newMobileId}`;
                    cy.get(newMobileNumber).scrollIntoView();
                    cy.get('.text-white').should('exist');
                    cy.get('.text-white a')
                      .should('have.attr', 'href', '/assets/pdf/Final-terms-for-DIY-account-opening.pdf')
                      .and('have.class', 'text-blue zbclr')
                      .and('have.attr', 'target', '_blank')
                      .and('contain.text', 'terms & conditions');
                    cy.get(newMobileNumber).type('9004300384', { force: true });
                    cy.get(newMobileNumber).siblings('#btnSubmit').click({ force: true });
                    cy.wait(10000)
                    cy.get('.get-started-img-wrap').should('exist').should('be.visible');
                    cy.url().should('include', 'diy/verify-mobile');
                    cy.get('#txtMobile', { timeout: 0 }).should('exist');
                    currentIndex++;
                  })
                  .then(() => {
                    expect(currentIndex).to.equal(count);
                  });
              });
          }
        });
      });

      it('sticky footer', () => {
        cy.get('#stickey-form').scrollIntoView();
        cy.url().then((url) => {
          const getURL = url;
          const splitSegments = getURL.split('/');
          if (getURL.includes('/en/knowledge-base/') && splitSegments.length === 7 && !getURL.endsWith('/en/knowledge-base/')) {
            cy.get('#stickey-form').find('#btnSubmit').as('submitButton');
            cy.get('#stickey-form').find('#txtMobile_app-footer').as('mobileInput');
            cy.get('@mobileInput').type('9004300384', { force: true });
            cy.get('@submitButton').click({ force: true });
            cy.get('.get-started-img-wrap').should('exist').should('be.visible');
            cy.url().should('include', 'diy/verify-mobile');
            cy.get('#txtOTP', { timeout: 0 }).should('exist') || cy.get('#txtOTP');
          } else if (getURL.includes('/stocks')) {
            cy.log('No Sticky lead form on this page');
          } else {
            cy.get('#stickey-form').find('#txtMobile_').as('mobileInput');
            cy.get('#stickey-form').find('#btnSubmit').as('submitButton');
            cy.get('@mobileInput').type('9004300384', { force: true });
            cy.get('@submitButton').click({ force: true });
            cy.get('.get-started-img-wrap').should('exist').should('be.visible');
            cy.url().should('include', 'diy/verify-mobile');
            cy.get('#txtOTP', { timeout: 0 }).should('exist');
          }
        });
      });
    });
  });
});
