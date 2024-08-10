Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe('Open Demat Account', () => {
  let user;
  let cyLogsArray = [];
  before(() => {
    cy.captureLogs(cyLogsArray);
  });
  beforeEach(() => {
    cy.visit(`https://${Cypress.env('UAT')}blinkx.in/open-demat-account`);
    cy.fixture('openDematAccount').then((userData) => {
      user = userData;
    });
  });
  it('footer test cases', () => {
    const logo = cy.get('img.logo-black-img').should('exist').and('be.visible');
    logo.should('have.attr', 'src', 'assets/images/logo-black.svg').and('have.attr', 'alt', 'BlinkXLogo');
    logo.should('have.attr', 'src').and('not.be.empty');
    cy.get('img.logo-black-img').should('have.attr', 'alt').and('not.be.empty');
    cy.get('img.logo-black-img').click({ multiple: true, force: true });
    cy.url().should('eq', `https://${Cypress.env('UAT')}blinkx.in/`);
    cy.go('back');

    //open demat account CTA
    cy.request(`GET`, `https://${Cypress.env('UAT')}blinkx.in/assets/images/logo-black.svg`)
      .its(`status`)
      .should(`eq`, 200);

    cy.get('a.btn.header-getstarted').should('be.visible').and('not.have.attr', 'disabled').contains('Open Demat Account').click({ force: true });

    cy.url().should('eq', `https://${Cypress.env('UAT')}blinkx.in/open-demat-account`);

    //title
    cy.get('h1').should('have.length', 1).should('exist').and('be.visible');

    //offer
    cy.get('.col-md-8.order-two').find('ul').should('exist').should('be.visible');

    //lead form
    cy.get('.form-footer').should('exist');
    cy.get('.form-footer a').should('have.attr', 'href', '/assets/pdf/Final-terms-for-DIY-account-opening.pdf').and('have.attr', 'target', '_blank').and('contain.text', 'terms & conditions');
    cy.get("input[placeholder='10-Digit Mobile Number']").type('9004300384', { force: true });
    cy.get('.form-card.leadform50-kc').find('.btn.common-btn').click({ force: true });
    cy.get('.get-started-img-wrap').should('exist').should('be.visible');
    cy.url().should('include', `diy/verify-mobile`);
    cy.get('#txtMobile', { timeout: 0 }).should('exist');
    cy.get("a[title='Edit']")
      .should('exist')
      .should('be.visible')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain('9004300384');
      });

    cy.visit(`https://${Cypress.env('UAT')}blinkx.in/open-demat-account`);
    //brokerage Title
    cy.get('.plan-header').should('exist').and('be.visible').and('contain', user.brokerageTitle);

    //table data
    cy.get('.data-table').should('exist').and('be.visible');
    user.tableHeader.forEach((header) => {
      cy.get('.data-table').contains('.oda-f25.bx-sec-head', header).should('exist');
    });
    user.tableDataEntries.forEach((entry) => {
      cy.get('.data-table').contains('tbody tr', entry).should('exist');
    });
    //our legacy
    cy.get('.common-section.legacy.legacy-cust').within(() => {
      cy.get('.bx-heading--two h2').should('have.text', 'Our Legacy');
      cy.get('.legacy-text-primary').should('have.length', 4);
      cy.get('.legacy-text-primary').eq(0).should('contain.text', '50 Years');
      cy.get('.legacy-text-secondary').eq(0).should('contain.text', 'of Trust');
      cy.get('.legacy-text-primary').eq(1).should('contain.text', '10 Lakhs +');
      cy.get('.legacy-text-secondary').eq(1).should('contain.text', 'Clients');
      cy.get('.legacy-text-primary').eq(2).should('contain.text', '88000 Cr +');
      cy.get('.legacy-text-secondary').eq(2).should('contain.text', 'AUM');
      cy.get('.legacy-text-primary').eq(3).should('contain.text', '38000 Cr +');
      cy.get('.legacy-text-secondary').eq(3).should('contain.text', 'Equity Average Trade Volume');

      cy.get('.row.text-center.hide-mobile').should('have.length', 1);
      cy.get('.row.text-center.hide-mobile').find('.col-md-3.col-3').should('have.length', 4);
      cy.get('.row.text-center.hide-mobile')
        .find('.hide-mobile')
        .each(($el) => {
          cy.wrap($el).should('have.attr', 'width', '100px').should('have.attr', 'height', '100px').should('have.attr', 'alt');
        });
    });
    //Why Open Demat Account
    cy.get('.bx-heading--two h2')
      .invoke('text')
      .then((text) => {
        expect(text.trim()).to.contain('Why Open Demat Account with BlinkX');
      });
    cy.get('#rewind').find('.item').should('have.length', 5);

    //title and step to open demat account
    cy.get('.bx-how--toopen---demataccount')
      .find('.bx-heading--two h2')
      .invoke('text')
      .then((text) => {
        const expectedText = 'How to open a Demat account';
        expect(text.trim()).to.equal(expectedText);
      });

    //what is deamt account
    cy.get('.bx-what-is--demat---wrap').within(() => {
      cy.get('h2:contains("What is a Demat account?")').should('exist');
      // cy.get('p').eq(0).should('contain', 'Demat account, which is short for "Dematerialized account"');
      cy.get('h2:contains("What are the Steps to Open a Demat Account?")').should('exist');
      cy.get('h2:contains("Documents required to Open Demat Account")').should('exist');
      cy.get('.bx-what-is-demat-acc').should('exist').should('be.visible');
    });

    //No charges
    cy.get('.bx-saving--no---charges')
      .find('.bx-heading--two')
      .invoke('text')
      .then((text) => {
        const cleanedText = text.replace(/\s+/g, ' ').trim();
        expect(cleanedText).to.equal('Count your Savings, Not Charges!');
      });

    cy.get('.bx-saving--nocharges---wrap').within(() => {
      cy.get('.bx-nocharge--foot p').each(($description, index) => {
        cy.wrap($description)
          .invoke('text')
          .then((text) => {
            const cleanedText = text.replace(/\s+/g, ' ').trim();
            expect(cleanedText).to.equal(user.charges[index]);
          });
      });

      cy.get('.bx-nocharge--head').each(($amount) => {
        cy.wrap($amount).should('have.text', '₹0');
      });
    });

    //testimonials
    cy.get("section[class='bx-what--customers---say'] div[class='container-fluid']").should('exist').should('be.visible');

    cy.get('.bx-heading--two').should('exist').should('be.visible');

    // Check if individual testimonials are displayed
    cy.get('.bx-what--customersay---card').should('have.length', 3);

    // Check the content of each testimonial
    cy.get('.bx-what--customersay---card').should('have.length', user.testimonials.length);

    // user.testimonials.forEach((testimonial, index) => {
    //   cy.get('.bx-what--customersay---card')
    //     .eq(index)
    //     .within(() => {
    //       cy.contains(testimonial.name).should('exist');
    //       cy.contains(testimonial.location).should('exist');
    //       cy.contains(testimonial.feedback).should('exist');
    //     });
    // });
    // title Investment Products
    cy.get('.bx-heading--two').should('exist').should('be.visible');

    //cy.get('.bx-our--product---card').should('have.length', 7);

    cy.get('.bx-our--product---wrap')
      .find('.bx-our--product---card')
      .each(($card, index) => {
        cy.wrap($card).within(() => {
          cy.get('h3').should('contain.text', user.expectedProducts[index].title);
          cy.get($card).should('have.attr', 'href', user.expectedProducts[index].url);
        });
      });

    //rating
    //cy.contains('Rated 4.6').should('exist');
    cy.contains('stars on Playstore.').should('exist');

    cy.get('.bx-star-rating-img').should('exist');

    //cy.contains('Explore the features that make BlinkX the only app you’ll ever need').should('exist');

    cy.get('a[href="https://play.google.com/store/apps/details?id=com.msf.blinktrade&pli=1"]').should('exist');
    cy.get('a[href="https://play.google.com/store/apps/details?id=com.msf.blinktrade&pli=1"]').should('have.attr', 'target', '_blank');

    cy.get('a[href="https://apps.apple.com/in/app/blinkx-stocks-ipo-demat-app/id6450943353"]').should('exist');
    cy.get('a[href="https://apps.apple.com/in/app/blinkx-stocks-ipo-demat-app/id6450943353"]').should('have.attr', 'target', '_blank');

    //FAQ
    cy.get('.accordian-wrap').scrollIntoView()
    cy.get('.accordian-wrap').should('be.visible').should('exist');
    cy.get('.accordian-wrap').within(() => { 
      cy.get('.clr-eb0c6e').should('be.visible').should('exist').should('not.be.empty').then($heading => {
        const headingText = $heading.text().trim();
        expect(headingText.toLowerCase()).to.eq('open demat account faqs');
      });
    });
    cy.get('#accordionCard .accordion-item').then(($items) => {
      cy.get('#accordionCard .accordion-item')
        .first()
        .within(() => {
          cy.get('.accordion-header').should('have.attr', 'aria-expanded', 'true');
          cy.get('.accordion-collapse').should('have.class', 'show');
          cy.get('.barlow_body.stdfaq-que').should('be.visible').should('exist').should('not.be.empty');
          cy.get('.accordion-body.stdfaq-ans').find('p').eq(1).should('be.visible').should('exist').should('not.be.empty');
        });

      // Iterate over each FAQ item starting from the second one (index 1)
      cy.get('.accordion-item.stdfaq').each(($el, index) => {
        if (index > 0) {
          // Skip the first item
          cy.wrap($el).within(() => {
            cy.get('.accordion-header')
              .click({ force: true, timeout: 5000 })
              .then(() => {
                // Assert the accordion item is expanded
                cy.get('.accordion-header').should('have.attr', 'aria-expanded', 'true');
                cy.get('.accordion-collapse').should('have.class', 'show');
                cy.get('.barlow_body.stdfaq-que').should('be.visible').should('exist').should('not.be.empty');
                cy.get('.accordion-body.stdfaq-ans').find('p').eq(1).should('be.visible').should('exist').should('not.be.empty');
              });
          });
        }
      });
    });

    //tnc
    cy.get('.odaFAQTandC a').should('exist').and('have.attr', 'href', '/assets/pdf/799_Subscription_Plan_T&C.pdf').as('termsLink');

    // Click on the link and assert that it opens in a new tab
    cy.get('@termsLink').invoke('removeAttr', 'target').click();
    cy.url().should('include', '/assets/pdf/799_Subscription_Plan_T&C.pdf');
  });
  after(() => {
    cy.saveErrorLogs(cyLogsArray);
  });
});
