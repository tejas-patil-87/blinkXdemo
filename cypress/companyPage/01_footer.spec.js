Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
let consoleLogs = '';
let cyLogs = '';

describe('Footer test scenario', () => {
  const urlsToTest = require('../fixtures/urlsToTest.json');
  urlsToTest.forEach((urlsToTest) => {
    let user;
    let menuList = [];
    let subMenuDetails = [];
    let errorList = [];
    let errorListStocks = [];
    let topStocks = [];
    let topIndices = [];
    let errorTopIndices = [];
    let extractedArray = [];

    context(`Testing on URL: ${Cypress.env('UAT')}${urlsToTest}`, () => {
      beforeEach(() => {
        cy.visit('https://' + Cypress.env('UAT') + urlsToTest);
        cy.fixture('footerDetails').then((userData) => {
          user = userData;
        });
      });
      before(() => {
        Cypress.on('log:added', (log) => {
          cyLogs += log.message + '\n';
        });
      });

      it('footer test cases', () => {
        cy.get('.common-footer-new').scrollIntoView();
        cy.get('.footer-accordion.position-relative.accordion').should('be.visible').should('exist').should('not.be.empty');
        cy.get('#section15').scrollIntoView();
        cy.get('.footer-accordion.position-relative.accordion')
          .find('.accordion-item')
          .each(($el, index, $list) => {
            let menu = $el.find('button').text().trim();
            if (menu !== '') {
              menuList.push(menu);
            }
          }) //then.block
          .then(() => {
            if (user.footerNameAndId) {
              const expectedNames = user.footerNameAndId.map((item) => item.name);
              const mismatchedNames = [];
              for (let i = 0; i < menuList.length; i++) {
                if (menuList[i] !== expectedNames[i]) {
                  mismatchedNames.push(menuList[i]);
                }
              }
              if (mismatchedNames.length > 0) {
                cy.log(`[Error]: Mismatched names: ${mismatchedNames.join(', ')}`);
              } else {
                cy.log(`MenuList is correct`);
              }
            }
          });
        cy.get('.datalayerFooter').each(($el) => {
          const id = $el.attr('id');
          const text = $el.text().trim();
          const href = $el.attr('href');
          extractedArray.push({ id, text, href });

          const correspondingItem = user.accordionData.find((item) => item.id === id && item.text === text);

          if (correspondingItem) {
            expect(correspondingItem).to.deep.equal({ id, text, href });
            cy.checkRequestStatus(correspondingItem.href);
          } else {
            cy.log(`[Error]: No corresponding item found for ID: ${id}, Text: ${text}, and Href: ${href}`);
            errorList.push({ id, text, href });
          }
        });

        const errorListPromise = new Promise((resolve) => {
          cy.then(() => {
            errorList.forEach((item) => cy.log(`[Error]: ${item.text} is not present in footer`));
            cy.wrap(errorList)
              .should('be.empty')
              .then(() => resolve());
          });
        });

        const missingElementsPromise = new Promise((resolve) => {
          cy.then(() => {
            const missingElements = user.accordionData.filter((userElement) => !extractedArray.some((subMenuElement) => subMenuElement.id === userElement.id));
            missingElements.forEach((item) => cy.log(`[Error]: Missing Element: ${item.text}`));
            cy.log('[Error]: Missing Elements:', JSON.stringify(missingElements));
            cy.wrap(missingElements)
              .should('be.empty')
              .then(() => resolve());
          });
        });

        const lengthCheckPromise = new Promise((resolve) => {
          cy.then(() => {
            expect(extractedArray.length).to.equal(user.accordionData.length);
            resolve();
          });
        });

        Promise.all([errorListPromise, missingElementsPromise, lengthCheckPromise]).then(() => {
          // All assertions and checks have been completed
        });

        //stockDIR test cases
        cy.get('.bx-stock--directory---title').should('be.visible').should('exist').should('have.text', 'Stocks directory:');
        cy.get('.bx-stock--directory---filters').should('be.visible').should('exist').should('not.be.empty');

        cy.get('.bx-stock--directory---filters')
          .find('li')
          .each(($el) => {
            const StockDirName = $el.text().trim();
            const stockHref = $el.find('a').attr('href');
            cy.wrap(Promise.resolve(cy.checkRequestStatus(stockHref))).then((status) => {
              if (status === 'failed') {
                cy.log(`[Error] stockDIR failed for href: ${stockHref}`);
              }
            });
          });

        // Get started CTA
        cy.get('.get-started-btn[href="/open-demat-account"]').last().invoke('text').should('exist').should('not.be.empty').should('contain', 'Get started');
        cy.get('.container.container-1400.position-relative a')
          .invoke('attr', 'href')
          .then((href) => {
            cy.checkRequestStatus(href);
          });

        //download-app
        cy.get('.download-app')
          .find('a')
          .each(($el) => {
            cy.wrap($el).should('exist').should('be.visible').should('not.be.empty');
            const appURL = $el.attr('href');
            cy.checkRequestStatus(appURL);
          });

        // disclaimer and reg PDF
        // cy.get('.p-14.xs-mt0 a').each(($el) => {
        //   //cy.wrap($el).should('exist').should('not.be.empty');
        //   const assetPDF = $el.attr('href');
        //   cy.checkRequestStatus(assetPDF);
        // });

        //top stocks
        cy.get('.mostPopularTitle').scrollIntoView({});
        cy.get('.mostPopularTitle').should('be.visible').should('exist').should('not.be.empty').should('have.text', 'Most Popular on BlinkX');

        cy.get('.topBold').first().should('be.visible').should('exist').invoke('text').should('include', 'Top Stocks:');

        cy.get('div[class="topBold indicesText"]')
          .first()
          .find('a')
          .each(($el) => {
            const originalText = $el.text().trim();
            const modifiedText = originalText.replace(' |', '').trim();
            const href = $el.attr('href');
            const topStock = user.topStocksList.find((item) => item.href === href && item.text === modifiedText);

            if (topStock) {
              cy.then(() => {
                cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');
                expect(topStock.text).to.equal(modifiedText);
                expect(topStock.href).to.equal(href);
              });
              cy.checkRequestStatus(topStock.href);
              topStocks.push({ text: modifiedText, href });
              // cy.log(JSON.stringify(topStocks));
            } else {
              cy.log(' **[error]** ' + `No corresponding item found for Text: ${modifiedText} and Href: ${href}`);
              errorListStocks.push({ text: modifiedText, href });
            }
          });
        cy.then(() => {
          cy.log('Top stock which not available on page :', JSON.stringify(errorListStocks));
          cy.log('topStockErrorList:', JSON.stringify(errorListStocks));
          cy.log(JSON.stringify(topStocks));
          cy.log(JSON.stringify(user.topStocksList));
          expect(topStocks).to.deep.equal(user.topStocksList);
          cy.wrap(errorListStocks).should('be.empty');
          //cy.log('Top stock found on page:', JSON.stringify(topStocks));
          cy.wrap(user.topStocksList).should('have.length', topStocks.length);
        });

        cy.get('.topBold.indicesText')
          .last()
          .find('a')
          .each(($el) => {
            const originalText = $el.text().trim();
            const modifiedText = originalText.replace(' |', '').trim();
            const href = $el.attr('href');
            const topIndice = user.topIndicesList.find((item) => item.href === href && item.text === modifiedText);
            if (topIndice) {
              cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');
              cy.then(() => {
                expect(topIndice.text).to.equal(modifiedText);
                expect(topIndice.href).to.equal(href);
              });
              cy.checkRequestStatus(topIndice.href);

              topIndices.push({ text: modifiedText, href });
            } else {
              cy.log(' **[error]** ' + `No corresponding item found for Text: ${modifiedText} and Href: ${href}`);
              errorTopIndices.push({ text: modifiedText, href });
            }
          })
          .then(() => {
            cy.log('Top stock which not available on page :', JSON.stringify(errorTopIndices));
            cy.log('ErrorListTopIndices:', JSON.stringify(errorTopIndices));
            //cy.log('Top indices found on page:', JSON.stringify(topIndices));

            expect(topIndices).to.deep.equal(user.topIndicesList);
            cy.wrap(errorTopIndices).should('be.empty');
            cy.wrap(user.topIndicesList).should('have.length', topIndices.length);
          });
      });
    });
  });

  after(() => {
    const errorLogs = cyLogs.split('\n').filter((log) => log.includes('Error'));
    if (errorLogs.length > 0) {
      const errorData = { error: errorLogs };
      const testCaseName = Cypress.mocha.getRunner().suite.ctx.test.title;
      const errorLogFilePath = `logs/${testCaseName}-error-logs.json`;
      cy.writeFile(errorLogFilePath, errorData);
      cy.log('Cypress error logs saved to:', errorLogFilePath);
    } else {
      cy.log('No Cypress error logs present.');
    }
  });
});
