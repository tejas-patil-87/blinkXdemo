describe('stock Scenario', () => {
  const itemsWithNullCompName = [];
  beforeEach(function () {});
  it('stock issue', () => {
    cy.request({
      method: 'GET',
      url: 'https://siteapibetadev.blinkx.in/webapp/stock/getCompaniesName/all',
    }).then((res) => {
      if (res.body && res.body.data && res.body.data.getCompaniesNamesFromFirstLetter) {
        const companyNames = res.body.data.getCompaniesNamesFromFirstLetter;
        const modifiedArray = companyNames.map((str) => str.toLowerCase().replace(/ /g, '-'));
        cy.log('Total companies ' + modifiedArray.length);

        for (let i = 0; i < modifiedArray.length; i++) {
          cy.request({
            method: 'GET',
            url: `https://siteapibetadev.blinkx.in/webapp/stock/overview/marketData/${modifiedArray[i]}/BSE`,
            failOnStatusCode: false,
          }).then((res) => {
            if (res.status === 500) {
              itemsWithNullCompName.push(`${modifiedArray[i]}`);
            }
            // cy.log(JSON.stringify(itemsWithNullCompName));
            // console.log(itemsWithNullCompName)
          });
        }
        cy.then(() => {
          cy.log(JSON.stringify(itemsWithNullCompName));
          console.log('Final result Stock List with 500 response  code in BSE', itemsWithNullCompName);
        });
      } else {
        cy.log('Unexpected response structure');
      }
    });
  });
});
