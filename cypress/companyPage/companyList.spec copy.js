Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
describe('Company Page', () => {
  let companyNameList = [];
  it('Extract link and visit', () => {
    cy.visit(`https://blinkx.in/stocks/a-b-n-intercorp-ltd`);
    cy.visit(`https://blinkx.in/stocks/tata-consultancy-services-ltd`);
    cy.wait(10000);
    //Error pop up
    cy.get('.common-modal-inner').eq(1).should('not.be.visible');

    //breadcrumb company name
    cy.get('.bread-crumb li:last-child').should('be.visible').should('exist');

    //Price
    cy.get('.symbol-head').last().should('be.visible').should('exist');
    cy.get('.d-flex.mt-2').should('be.visible').should('exist');
    cy.get('.stock-price')
      .should('be.visible')
      .should('exist')
      .should(($el) => {
        expect($el.text().trim()).not.to.equal('₹0.00');
        expect($el.text().trim()).not.to.equal('Price not available'); // Example of alternative text
      });

    //Performance
    cy.get('.range_price').each(($el) => {
      cy.wrap($el).should(($p) => {
        expect($p.text().trim()).not.to.equal('0.00');
      });
    });

    //Performance 2
    cy.get('.performance-subdiv-value').each(($el) => {
      cy.wrap($el).should(($p) => {
        expect($p.text().trim()).not.to.equal('0');
      });
    });

    //fundamentals
    cy.get('.card.company-fundamentals-container').should('be.visible').should('exist');

    cy.get('table.table').should('be.visible');

    // #cashflow-tab
    // #keyratios-tab
    // #balancesheet-tab

    // FAQ
    cy.wait(10000);
    cy.get('.accordion.accordionCard')
      .find('h3')
      .each(($el) => {
        cy.wrap($el).find('.barlow_body.question-faq').should('not.be.empty');
      });
  });
});
