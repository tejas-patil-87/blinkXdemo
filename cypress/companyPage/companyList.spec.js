describe('Company Page', () => {
  let companyNameList = [];
  let companyNameListURL = [];
  it('Extract link and visit', () => {
    cy.visit('https://blinkx.in/stock-market-companies-list/a');

    cy.get('#eachCompany')
      .find('.card')
      .each(($el) => {
        let companyName = $el.text().trim();
        let formattedCompanyName = companyName
          .replace('&', '')
          .replace(/[\s&()]+/g, '-')
          .replace(/-+/g, '-')
          .toLowerCase();
        let companyURL = 'https://blinkx.in/stocks/' + formattedCompanyName;
        companyNameList.push(formattedCompanyName);
        companyNameListURL.push(companyURL);
      })
      .then(() => {
        const csvData = companyNameList
          .map((name, index) => {
            return `${name},${companyNameListURL[index]}`;
          })
          .join('\n');

        // Write CSV string to file
        cy.writeFile('cypress/downloads/companyNameList.csv', csvData);

        cy.writeFile('cypress/fixtures/companyNameList.json', companyNameList);
        console.log('List of companies:', JSON.stringify(companyNameList));
      });
  });
});
