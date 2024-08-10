Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
let cyLogsArray = [];

before(() => {
  cy.captureLogs(cyLogsArray);
});

describe('Footer test scenario', () => {
  const urlsToTest = require('../fixtures/urlsToTest.json');
  urlsToTest.forEach((urlsToTest) => {
    let user;
    let menuList = [];
    let missingElements;
    let errorList = [];
    let errorListStocks = [];
    let topStocks = [];
    let topIndices = [];
    let errorTopIndices = [];
    let extractedArray = [];
    let href_array = [];
    let failed_urls = [];

    context(`Testing on URL: ${Cypress.env('UAT')}${urlsToTest}`, () => {
      beforeEach(() => {
        cy.visit('https://' + Cypress.env('UAT') + urlsToTest);
        cy.fixture('footerDetails').then((userData) => {
          user = userData;
        });
      });

      it('Footer main menu', () => {
        cy.get('.common-footer-new').scrollIntoView();
        cy.get('.footer-accordion.position-relative.accordion').should('be.visible').should('exist').should('not.be.empty');
        cy.get('#section15').scrollIntoView();
        cy.get('.footer-accordion.position-relative.accordion')
          .find('.accordion-item')
          .each(($el) => {
            let menu = $el.find('button').text().trim();
            if (menu !== '') {
              menuList.push(menu);
            }
            // cy.wrap($el).click({force:true})
          }) //then.block
          .then(() => {
            if (user.footerNameAndId) {
              const expectedNames = user.footerNameAndId.map((item) => item.name);
              const mismatchedNames = menuList.filter((item, index) => item !== expectedNames[index]);

              if (mismatchedNames.length > 0) {
                cy.log(`[Error]: Mismatched names: ${mismatchedNames.join(', ')}`);
              } else {
                cy.log(`MenuList is correct`);
              }
            }
          });
      });

      it.only('Footer Sub menu', () => {
        cy.get('.datalayerFooter').each(($el) => {
          const id = $el.attr('id');
          const text = $el.text().trim();
          const href = $el.attr('href');
          extractedArray.push({ id, text, href });

          let correspondingItem = user.accordionData.find((item) => item.id == id && item.text == text);

          if (!correspondingItem) {
            cy.log(`item not found Elist: ${JSON.stringify({ id, text, href })}`);
            errorList.push({ id, text, href });
          }
          missingElements = user.accordionData.filter((userElement) => !extractedArray.some((subMenuElement) => subMenuElement.id === userElement.id));
          console.log(`Missing element: ${JSON.stringify(missingElements)}`);
          cy.checkRequestStatus(href).then((failedUrl) => {
            if (failedUrl == null) {
              return;
            } else {
              failed_urls.push(failedUrl);
            }
          });
        });
        cy.then(() => {
          cy.wrap(failed_urls, { timeout: 0 }).should('be.empty');
        });

        cy.then(() => {
          if (errorList.length > 0) {
            errorList.forEach((item) => cy.log(`[Error]: ${item.text} is not present in footer`));
            cy.wrap(errorList, { timeout: 0 })
              .should('be.empty')
              .then(() => resolve());
          }
        });

        cy.then(() => {
          if (missingElements.length > 0) {
            missingElements.forEach((item) => cy.log(`[Error]: ${item.text} this option is missing form footer sub-menu`));
            console.log('[Error]: Missing Elements:', JSON.stringify(missingElements));
            cy.wrap(missingElements, { timeout: 0 })
              .should('be.empty')
              .then(() => resolve());
          }
        });
        cy.then(() => {
          if (expect(extractedArray.length).to.equal(user.accordionData.length)) {
            cy.log('Footer sub-menu link are as expected');
           
          } else {
            cy.log('[Error]: Footer sub-menu does not have links as expected');
          }
        });
      });

      it('StockDIR test cases', () => {
        //stockDIR test cases
        cy.get('.bx-stock--directory---title').should('be.visible').should('exist').should('have.text', 'Stocks directory:');
        cy.get('.bx-stock--directory---filters').should('be.visible').should('exist').should('not.be.empty');

        cy.get('.bx-stock--directory---filters')
          .find('li')
          .each(($el) => {
            const StockDirName = $el.text().trim();
            const stockHref = $el.find('a').attr('href');
            failed_urls = [];
            cy.checkRequestStatus(stockHref).then((failedUrl) => {
              if (failedUrl == null) {
                return;
              } else {
                failed_urls.push(failedUrl);
              }
            });
            // cy.wrap(Promise.resolve(cy.checkRequestStatus(stockHref))).then((status) => {
            //   if (status === 'failed') {
            //     cy.log(`[Error]: stockDIR failed for href: ${stockHref}`);
            //   }
            // });
          });
        cy.then(() => {
          cy.wrap(failed_urls, { timeout: 1000 }).should('be.empty');
        });
      });
      it('Get started CTA', () => {
        // Get started CTA
        cy.get('.get-started-btn[href="/open-demat-account"]').last().invoke('text').should('exist').should('not.be.empty').should('contain', 'Get started');
        cy.get('.container.container-1400.position-relative a')
          .invoke('attr', 'href')
          .then((href) => {
            failed_urls = [];
            cy.checkRequestStatus(href).then((failedUrl) => {
              if (failedUrl == null) {
                return;
              } else {
                failed_urls.push(failedUrl);
              }
            });
          });
        cy.then(() => {
          cy.wrap(failed_urls, { timeout: 1000 }).should('be.empty');
        });
      });
      it('Download-app', () => {
        //download-app
        cy.get('.download-app')
          .find('a')
          .each(($el) => {
            cy.wrap($el).should('exist').should('be.visible').should('not.be.empty');
            const appURL = $el.attr('href');
            failed_urls = [];
            cy.checkRequestStatus(appURL).then((failedUrl) => {
              if (failedUrl == null) {
                return;
              } else {
                failed_urls.push(failedUrl);
              }
            });
          });
        cy.then(() => {
          cy.wrap(failed_urls, { timeout: 1000 }).should('be.empty');
        });
      });
      it('Registration details and Disclaimer', () => {
        let failed_urls = [];

        const links = ['/assets/pdf/Registration_details.pdf', '/assets/pdf/Disclaimer_Blinkx.in.pdf'];

        links.forEach((link, index) => {
          cy.get(`a[href="${link}"]`)
            .should('exist')
            .should('not.be.empty')
            .then(($link) => {
              const href = $link.attr('href');

              cy.log(`Link ${index + 1}: ${href}`);

              expect(href).to.not.be.empty;

              cy.checkRequestStatus(href).then((failedUrl) => {
                if (failedUrl) {
                  failed_urls.push(failedUrl);
                }
              });
            });
        });

        cy.then(() => {
          cy.wrap(failed_urls).should('be.empty');
        });
      });
      it('Top stocks', () => {
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
            failed_urls = [];

            if (topStock) {
              cy.then(() => {
                cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');
                expect(topStock.text).to.equal(modifiedText);
                expect(topStock.href).to.equal(href);
              });
              cy.checkRequestStatus(href).then((failedUrl) => {
                if (failedUrl == null) {
                  return;
                } else {
                  failed_urls.push(failedUrl);
                }
              });
              topStocks.push({ text: modifiedText, href });

              // cy.log(JSON.stringify(topStocks));
            } else {
              console.log(`Error at Top stock ${JSON.stringify(errorListStocks)}`);
              errorListStocks.push({ text: modifiedText, href });
            }
          });
        cy.then(() => {
          cy.wrap(failed_urls, { timeout: 1000 }).should('be.empty');
        });
        cy.then(() => {
          if (errorListStocks.length > 0) {
            //cy.log('[Error]:Top stock which not available on page :', JSON.stringify(errorListStocks));
            errorListStocks.forEach((item) => cy.log(`[Error]: Top stock which not available on page ${item.text} is not present in footer`));
            expect(topStocks).to.deep.equal(user.topStocksList);
            cy.wrap(errorListStocks, { timeout: 1000 }).should('be.empty');
            //cy.log('Top stock found on page:', JSON.stringify(topStocks));
            cy.wrap(user.topStocksList).should('have.length', topStocks.length);
          } else {
            cy.log('Top stocks is correct');
          }
        });
      });
      it('Indices', () => {
        cy.get('.topBold.indicesText')
          .last()
          .find('a')
          .each(($el) => {
            const originalText = $el.text().trim();
            const modifiedText = originalText.replace(' |', '').trim();
            const href = $el.attr('href');
            const topIndice = user.topIndicesList.find((item) => item.href === href && item.text === modifiedText);
            failed_urls = [];
            cy.then(() => {
              cy.checkRequestStatus(href).then((failedUrl) => {
                if (failedUrl == null) {
                  return;
                } else {
                  failed_urls.push(failedUrl);
                }
              });
            });
            if (topIndice) {
              cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');
              // cy.then(() => {
              //   expect(topIndice.text).to.equal(modifiedText);
              //   expect(topIndice.href).to.equal(href);
              // });

              topIndices.push({ text: modifiedText, href });
            } else {
              console.log(`Error at indices ${JSON.stringify(errorTopIndices)}`);
              errorTopIndices.push({ text: modifiedText, href });
            }
          });
        cy.then(() => {
          cy.wrap(failed_urls, { timeout: 1000 }).should('be.empty');
        });
        cy.then(() => {
          if (errorTopIndices.length > 0) {
            cy.log('Top stock which not available on page :', JSON.stringify(errorTopIndices));
            errorTopIndices.forEach((item) => cy.log(`[Error]: Top indices which not available on page ${item.text} is not present in footer`));
            //cy.log('ErrorListTopIndices:', JSON.stringify(errorTopIndices));
            //cy.log('Top indices found on page:', JSON.stringify(topIndices));
            //expect(topIndices).to.deep.equal(user.topIndicesList);
            cy.wrap(errorTopIndices).should('be.empty', { setTimeout: 1000 });
            cy.wrap(user.topIndicesList).should('have.length', topIndices.length);
          } else {
          }
        });
      });
    });
  });

  after(() => {
    cy.saveErrorLogs(cyLogsArray);
  });
});
