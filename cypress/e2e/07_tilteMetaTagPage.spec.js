Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Meta Tags and Schema Test', () => {
  const footerStockLinks = require('../fixtures/footerDetails.json');
  let urlsForTest = footerStockLinks.topStocksList.map((stock) => stock.href);
  urlsForTest.push('/stocks/teerth-gopicon-ltd', '/stocks/jm-financial-ltd', '/stocks/umiya-tubes-ltd', '/stocks/shriram-city-union-finance-ltd');

  urlsForTest.forEach((urlForTest) => {
    context(`Testing on URL: ${Cypress.env('UAT')}blinkx.in${urlForTest}`, () => {
      beforeEach(() => {
        let stockUrl = `https://${Cypress.env('UAT')}blinkx.in${urlForTest}`;
        cy.visit(stockUrl);
      });
      it('check Meta title, meta description, canonical URL, and schema markup For Company page', () => {
        cy.wait(1000);
        cy.get('.symbol-head', { timeout: 20000 })
          .should('exist')
          .should('not.be.empty')
          .then(($heading) => {
            const headingText = $heading.text().trim();
            cy.log('Extracted Company Name', headingText);
            cy.url().then((url) => {
              const urlObject = new URL(url);
              cy.title().should('eq', `${headingText} Share Price Today - Stock Price Live - NSE/BSE | BlinkX`);
              cy.get('head meta[name="description"]').should(
                'have.attr',
                'content',
                `${headingText} share price today - Get ${headingText} live NSE/BSE stock price with fundamentals, latest news, profit & loss, share holding, company profile, peer comparison at BlinkX.`,
              );
              cy.get('head link[rel="canonical"]').should('have.attr', 'href', urlObject.origin + urlObject.pathname);
              cy.get('script[type="application/ld+json"]').then(($script) => {
                const jsonLDArray = JSON.parse($script.text());
                expect(jsonLDArray).to.be.an('array');
                const types = jsonLDArray.map((jsonLD) => jsonLD['@type']);
                expect(types).to.include.members(['WebPage', 'FAQPage', 'BreadcrumbList']);
              });
            });
          });
      });
    });
  });
});
