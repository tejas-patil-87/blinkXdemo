describe('Company Page', () => {
    let companyNameList = [];
  
    it('Extract link and visit', () => {
      cy.visit(`https://${Cypress.env('UAT')}blinkx.in/stock-market-companies-list/m`);
  
      cy.get('#eachCompany')
        .find('.card')
        .each(($el) => {
          let companyName = $el.text().trim();
          let formattedCompanyName = companyName
            .replace('&', '')
            .replace(/[\s&()]+/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase();
          let companyURL = `https://${Cypress.env('UAT')}blinkx.in/stocks/` + formattedCompanyName;
          companyNameList.push({
            name: formattedCompanyName,
            url: companyURL
          });
        })
        .then(() => {
          // Write JSON object to file
          cy.writeFile('cypress/fixtures/companyNameList.json', companyNameList);
          console.log('List of companies:', JSON.stringify(companyNameList));
        });
    });
  });
  