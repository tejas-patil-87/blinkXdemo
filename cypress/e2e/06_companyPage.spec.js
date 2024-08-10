Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
let cyLogsArray = [];
let failed_urls = [];

before(() => {
  cy.captureLogs(cyLogsArray);
});

describe('Company pages test scenario', () => {
  let company = 'tata-consultancy-services-ltd';
  let companyName = company
    .replace(/-/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  let testURL = `https://${Cypress.env('UAT')}blinkx.in/stocks/${company}`;
  context(`Testing on URL: ${testURL}`, () => {
    beforeEach(() => {
      cy.visit(testURL, { failOnStatusCode: false });
    });
    it(`Check Company logo, Title, Breadcrumb, Stock-price, Price difference and Date`, () => {
      //img check

      cy.get('.company-logo-image', { timeout: 20000 })
        .should('be.visible')
        .should('exist')
        .and(($img) => {
          expect($img[0].naturalWidth).to.be.greaterThan(0);
        });
      cy.wait(1000);
      //title
      cy.get('.symbol-head', { timeout: 10000 })
        .should('exist')
        .should('exist')
        .should('not.be.empty')
        .then(($heading) => {
          const headingText = $heading.text().trim();
          expect(headingText).to.eq(companyName);
        });

      cy.get('.stocks-tags').should('have.length', 2);

      cy.get('.stocks-tags').eq(0).find('p').should('exist');

      cy.get('.stocks-tags').eq(1).find('p').should('exist');

      //breadcrumb company name
      cy.get('.bread-crumb').should('be.visible').should('exist');

      //stock-price
      cy.get('.stock-price').should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');

      //price diff
      cy.get('#addclrpricedifference').should('be.visible').should('exist').should('not.be.empty');

      //date
      cy.get('.last-updated').should('be.visible').should('exist').should('not.be.empty');
      function getTodaysDate() {
        const date = new Date();

        const month = date.toLocaleString('default', { month: 'long' });
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        return `${month} ${day}, ${year}`;
      }
      cy.get('.last-updated')
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.include(`As on ${getTodaysDate()}`);
        });
    });
    it('Verify NSE tab is active by default & Switch to BSE tab', () => {
      if (cy.get('#nseTab').should('exist') && cy.get('#bseTab').should('exist')) {
        cy.get('#nseTab').should('have.class', 'active_exchng_select');
        cy.wait(1000);
        cy.get('#priceeDifference', { timeout: 10000 })
          .should('exist')
          .should('not.be.empty')
          .invoke('text')
          .then((text) => {
            cy.log('-----------' + text.trim());
            cy.then(() => {
              cy.wait(1000);
              expect(text.trim()).to.not.be.empty;
            });
          });

        cy.get('#bseTab').click();
        cy.get('#bseTab').should('have.class', 'active_exchng_select');
        cy.wait(1500);
        cy.get('#priceeDifference', { timeout: 30000 })
          .should('exist')
          .should('not.be.empty')
          .invoke('text')
          .then((text) => {
            cy.log('-----------' + text.trim());
            cy.then(() => {
              expect(text.trim()).to.not.be.empty;
            });
          });
      } else {
      }
      // cy.get('#bseTab').click();
      // cy.get('#bseTab').should('have.class', 'active_exchng_select');
      // cy.get('#nseTab').click();
      // cy.get('#nseTab').should('have.class', 'active_exchng_select');
    });
    it('Verify presence and the graph plot area', () => {
      cy.get('#companyStocksGraph', { timeout: 20000 }).should('exist').and('be.visible');

      cy.get('.highcharts-plot-background').should('exist').and('be.visible');
      cy.get('.highcharts-plot-border').should('exist').and('be.visible');
      cy.get('.highcharts-grid').should('exist').and('be.visible');
      cy.get('.highcharts-grid-line').should('exist').and('be.visible');
      cy.get('.highcharts-markers').should('exist').and('be.visible');

      cy.get('.highcharts-container', { timeout: 5000 }).then((chartContainer) => {
        cy.window().then((win) => {
          const highcharts = win.Highcharts;
          assert.isNotNull(highcharts, 'Highcharts is loaded');
          assert.isNotNull(highcharts.charts[0], 'Chart instance is loaded');

          cy.wait(2000).then(() => {
            const chart = highcharts.charts[0];
            assert.isNotNull(chart.tooltip, 'Tooltip is initialized');

            chart.tooltip.refresh(chart.series[0].points[0]);

            cy.get('.highcharts-tooltip', { timeout: 15000 }).should('exist').and('be.visible');
            cy.get('.highcharts-label-box', { timeout: 5000 }).should('exist').and('be.visible');
          });
        });

        cy.get('.highcharts-point', { timeout: 5000 }).should('exist').and('be.visible');
      });
    });

    it('Verify data reflects upon clicking on buttons', () => {
      const buttons = ['1D', '1W', '1M', '1Y', '3Y', '5Y', 'ALL'];

      buttons.forEach((buttonText) => {
        cy.contains('.comp-btn', buttonText).click({ force: true });

        // cy.wait(500);

        cy.get('#changePriceDayId').should('contain', buttonText);
      });
    });
    it('Fundamentals', () => {
      //Performance
      cy.get('#Performance')
        .find('.stock-name')
        .then(($heading) => {
          const headingText = $heading.text().trim();
          expect(headingText).to.eq(`${companyName} Performance`);
        });
      cy.get('.range_price').each(($el) => {
        cy.wrap($el)
          .should('exist')
          .and('be.visible')
          .and(($p) => {
            expect($p.text().trim()).not.to.equal('0.00');
          });
      });

      //Performance 2
      cy.get('.performance-subdiv-value').each(($el) => {
        cy.wrap($el)
          .should('exist')
          .and('be.visible')
          .and(($p) => {
            expect($p.text().trim()).not.to.equal('0');
          });
      });

      //fundamentals
      cy.get('#Fundamentals')
        .find('.stock-name')
        .then(($heading) => {
          const headingText = $heading.text().trim();
          expect(headingText).to.eq(`${companyName} Fundamentals`);
        });

      // cy.get('.card.company-fundamentals-container').should('be.visible').should('exist');
      cy.get('.fundamentals-title').each(($el) => {
        cy.wrap($el)
          .should('exist')
          .and('be.visible')
          .and(($p) => {
            expect($p.text().trim()).not.to.be.empty;
          });
      });

      cy.get('.fundamentals-value').each(($el) => {
        cy.wrap($el)
          .should('exist')
          .and('be.visible')
          .and(($p) => {
            expect($p.text().trim(), { timeout: 0 }).not.to.be.empty;
          });
      });
      cy.get('.custom-button-modal').click();
      cy.get('.modal').should('be.visible');
    });

    it('FNO', () => {
      cy.wait(1000);
      cy.get('.stock-name-fo').eq(0).should('be.visible').should('exist').should('not.be.empty').should('have.text', `${companyName} F&O`);
      cy.get("div[id='F&O'] div[class='tableBoxSecond']").should('be.visible').should('exist').should('not.be.empty');
      cy.get('.matchedStock').eq(0).should('be.visible').should('exist').should('not.be.empty').should('have.attr', 'href', '/stocks/tata-consultancy-services-ltd-option-chain');
      cy.get('.matchedName').eq(0).should('be.visible').should('exist').should('not.be.empty').contains('Option Chain');
      cy.get('.arrow').eq(0).should('exist');
      cy.get('.matchedName').eq(0).click();
      cy.get('.arrow').eq(0).should('have.attr', 'src', '../../../../assets/icons/arrow-up-down.svg');
      cy.url().should('include', '/stocks/tata-consultancy-services-ltd-option-chain');
      cy.go('back');
    });
    it('Financial', () => {
      cy.get('.stock-name-fo').eq(1).should('be.visible').should('exist').should('not.be.empty').should('have.text', `${companyName} Financials`);
      cy.get('.matchedStock').eq(1).should('be.visible').should('exist').should('not.be.empty').should('have.attr', 'href', '/stocks/tata-consultancy-services-ltd-financials');
      cy.get('.matchedName').eq(1).should('be.visible').should('exist').should('not.be.empty').contains('Financials');
      cy.get('.arrow').eq(1).should('have.attr', 'src', '../assets/images/about-us/arrow.png');
      cy.get('.matchedStock').eq(1).click();
      cy.url().should('include', '/stocks/tata-consultancy-services-ltd-financials');
    });
    it('Shareholding Pattern', () => {
      cy.get('.card.company-shareholding-pattern').find('.stock-name').should('be.visible').should('exist').should('not.be.empty').should('have.text', `${companyName} Shareholding Pattern`);

      cy.get(' .table-share-holding-pattern').within(() => {
        cy.get('.table-header').should('be.visible').should('exist').should('not.be.empty');
        cy.get('.table-header')
          .find('th')
          .each(($el) => {
            cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');
          });
        cy.get('tr')
          .find('td')
          .each(($el) => {
            cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');
          });
      });
    });

    it('Resistance and Support', () => {
      cy.get('.card.app-company-resistance-support').find('.stock-name').should('have.text', 'Resistance and Support');
      cy.get('.row.mt-3').should('be.visible').should('exist').should('not.be.empty');
      cy.get('.row.mt-3')
        .find('.resistance-heading')
        .eq(0)
        .should('be.visible')
        .should('exist')
        .should('not.be.empty')
        .then(($heading) => {
          const headingText = $heading.text().trim();
          expect(headingText).to.eq('Resistance');
        });
      cy.get('.resistance-subheading').contains('First Resistance').siblings('.resistance-numbers').should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');

      cy.get('.resistance-subheading').contains('Second Resistance').siblings('.resistance-numbers').should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');

      cy.get('.resistance-subheading').contains('Third Resistance').siblings('.resistance-numbers').should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');
      cy.get('.row.mt-3')
        .find('.resistance-heading')
        .eq(1)
        .should('be.visible')
        .should('exist')
        .should('not.be.empty')
        .then(($heading) => {
          const headingText = $heading.text().trim();
          expect(headingText).to.eq('Support');
        });
      cy.get('.resistance-subheading').contains('First Support').siblings('.support-numbers').should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');

      cy.get('.resistance-subheading').contains('Second Support').siblings('.support-numbers').should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');

      cy.get('.resistance-subheading').contains('Third Support').siblings('.support-numbers').should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');
    });
    it('Delivery and Volume', () => {
      cy.get('#Delivery-Volume')
        .find('.stock-name')
        .should('be.visible')
        .should('exist')
        .should('not.be.empty')
        .then(($heading) => {
          const headingText = $heading.text().trim();
          expect(headingText).to.eq('Delivery and Volume');
        });
      cy.get('.card.mb-0.pt-0').should('be.visible').should('exist').should('not.be.empty');
      cy.get('table.delVol-table').within(() => {
        cy.get('tr')
          .first()
          .within(() => {
            cy.get('th')
              .eq(0)
              .should('be.visible')
              .should('exist')
              .should('not.be.empty')
              .invoke('text')
              .then((text) => {
                expect(text.trim()).to.eq('Period');
              });
            cy.get('th')
              .eq(1)
              .should('be.visible')
              .should('exist')
              .should('not.be.empty')
              .invoke('text')
              .then((text) => {
                expect(text.trim()).to.eq('Delivery Volume');
              });
            cy.get('th')
              .eq(2)
              .should('be.visible')
              .should('exist')
              .should('not.be.empty')
              .invoke('text')
              .then((text) => {
                expect(text.trim()).to.eq('Traded Volume');
              });
            cy.get('th')
              .eq(3)
              .should('be.visible')
              .should('exist')
              .should('not.be.empty')
              .invoke('text')
              .then((text) => {
                expect(text.trim()).to.eq('Delivery Volume %');
              });
          });
        const expectedPeriods = ['Day', 'Week', '1 Month', '6 Months'];
        cy.get('tr').each((row, index) => {
          if (index > 0) {
            cy.wrap(row).within(() => {
              cy.get('td')
                .eq(0)
                .should('be.visible')
                .should('exist')
                .should('not.be.empty')
                .invoke('text')
                .then((text) => {
                  expect(text.trim()).to.eq(expectedPeriods[index - 1]);
                });

              cy.get('td').eq(1).should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');

              cy.get('td').eq(2).should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');

              cy.get('td').eq(3).should('be.visible').should('exist').should('not.be.empty').should('not.eq', '0.00');
            });
          }
        });
      });
    });
    it('About Company', () => {
      cy.log(companyName);
      cy.get('.card.company-about').find('.stock-name').should('have.text', `About ${companyName}`);
      cy.get('.card.company-about').should('be.visible').should('exist').should('not.be.empty');
      cy.get('.more.detail-company').should('be.visible').should('exist').should('not.be.empty');
      cy.get('.read-more-less-button').should('be.visible').should('exist').should('not.be.empty');
      cy.get('.read-more-less-button')
        .should('be.visible')
        .should('exist')
        .then(($heading) => {
          const headingText = $heading.text().trim();
          expect(headingText).to.eq('Read More');
        });

      cy.get('.mt-2.mb-2.description-div')
        .invoke('height')
        .then((initialHeight) => {
          cy.get('.read-more-less-button').click();

          cy.get('.read-more-less-button').then(($heading) => {
            const headingText = $heading.text().trim();
            expect(headingText).to.eq('Read Less');
          });

          cy.get('.mt-2.mb-2.description-div').invoke('height').should('be.greaterThan', initialHeight);
          cy.get('.read-more-less-button')
            .should('be.visible')
            .should('exist')
            .then(($heading) => {
              const headingText = $heading.text().trim();
              expect(headingText).to.eq('Read Less');
            });
          cy.get('.mt-2.mb-2.description-div')
            .invoke('height')
            .then((expandedHeight) => {
              cy.get('.read-more-less-button').click();

              cy.get('.read-more-less-button')
                .should('be.visible')
                .should('exist')
                .then(($heading) => {
                  const headingText = $heading.text().trim();
                  expect(headingText).to.eq('Read More');
                });

              cy.get('.mt-2.mb-2.description-div').invoke('height').should('be.lessThan', expandedHeight);
            });
        });
      //md

      cy.get('.content-container.mt-3').should('be.visible').should('exist').should('not.be.empty');
    });
    it('Company Management Table', () => {
      cy.get('#Management').find('.stock-name').should('be.visible').should('exist').should('not.be.empty').should('have.text', `${companyName} Management`);

      cy.get('.card.company-management').should('be.visible').should('exist').should('not.be.empty');

      cy.get('.management-table-header').should('exist');
      cy.get('.management-table-heading').should('have.length', 2); // Assuming there are two columns

      cy.get('.management-table-subheader')
        .should('exist')
        .each(($row) => {
          cy.wrap($row).within(() => {
            cy.get('.management-table-subheading-left').should('exist').should('not.be.empty');
            cy.get('.management-table-subheading').should('exist').should('not.be.empty');
            cy.get('.management-table-subheading').should('be.visible');
          });
        });
    });
    it('Events', () => {
      cy.get('#Events').find('.stock-name').should('be.visible').should('exist').should('not.be.empty').should('have.text', `Events`);

      // cy.get('.card.company-management').should('be.visible').should('exist').should('not.be.empty');
      cy.get('#Events')
        .find('.mt-3')
        .each(($el) => {
          cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');
        });
    });

    it('News', () => {
      cy.get('#News').should('be.visible').should('exist').should('not.be.empty');
      cy.get('#News').find('.stock-name').should('be.visible').should('exist').should('not.be.empty').should('have.text', `${companyName} News`);
      cy.get('.news-card').should('have.length.greaterThan', 0);
      cy.get('#News')
        .find('.news-card')
        .each(($el, index, $list) => {
          if (index >= $list.length) {
            return false;
          }

          cy.wrap($el).should('be.visible').should('exist').should('not.be.empty');

          cy.wrap($el).within(() => {
            cy.get('.companyNewsModalbtn').should('be.visible').click({ force: true });
          });

          cy.wrap($el).find('.modal').should('be.visible');
          cy.wrap($el).find('.modal-title').should('not.be.empty');
          cy.wrap($el).find('.companyNewsModalhtml').should('not.be.empty');

          cy.wrap($el).find('.btn-close').click({ multiple: true, force: true });
          cy.wrap($el).find('.modal').should('not.be.visible');
        });
    });
    it('Similar Stocks', () => {
      cy.get('#Similiar-Stocks').should('be.visible').should('exist').should('not.be.empty');
      cy.get('#Similiar-Stocks').find('.stock-name').should('be.visible').should('exist').should('not.be.empty').should('have.text', 'Similar Stocks');

      cy.get('.stocks-table th').then((headers) => {
        const expectedHeaders = ['Company', 'Market Cap', 'Market Price', 'P/E Ratio'];
        headers.each((index, header) => {
          cy.wrap(header).should('contain.text', expectedHeaders[index]);
        });
      });

      cy.get('.stocks-table').each((row) => {
        cy.wrap(row)
          .find('td')
          .each(($el) => {
            cy.wrap($el)
              .should('have.length.at.least', 1)
              .each((cell) => {
                cy.wrap(cell).should('not.be.empty');
              });
          });
        cy.wrap(row)
          .find('td')
          .first()
          .find('a')
          .then((link) => {
            const tableCompanyName = link.text().trim().toLowerCase().replace(/\s+/g, '-');
            cy.wrap(link)
              .should('have.attr', 'href')
              .then((href) => {
                expect(href).to.include(tableCompanyName);
                cy.wrap(link).click();
                cy.url().should('include', href);
                cy.go('back');
              });
          });
      });
    });

    it('Top Stocks', () => {
      cy.get('#Top-Stocks').eq(0).should('be.visible').should('exist').should('not.be.empty');
      cy.get('#Top-Stocks').eq(0).find('.stock-name').should('be.visible').should('exist').should('not.be.empty').should('have.text', 'Top Stocks');

      cy.get('.topstocks-card')
        .eq(0)
        .within(() => {
          cy.get('.cards-company-heading').contains('Market Price');
          cy.get('.cards-company-price').should('exist');
          cy.get('.cards-company-heading').contains('Company Name');
          cy.get('.top-company-names').then(($companyName) => {
            const companyNameText = $companyName.text().trim();
            cy.get('a')
              .should('have.attr', 'href')
              .then((href) => {
                const formattedCompanyName = companyNameText.toLowerCase().replace(/\s+/g, '-');
                expect(href).to.include(formattedCompanyName);

                // Click on the link and validate URL
                cy.get('a').click();
                cy.url().should('include', href);
                // Go back to the previous page
                cy.go('back');
              });
          });
        });
    });

    it("What's Trending", () => {
      cy.get('.card.app-company-what-trending').should('be.visible').should('exist').should('not.be.empty');
      cy.get('.card.app-company-what-trending').find('.stock-name').should('be.visible').should('exist').should('not.be.empty').should('have.text', "What's Trending");
      cy.get('.trending-sec').should('be.visible').should('exist').should('not.be.empty');
      const elements = [
        { text: 'NIFTY 50', href: '/indices/nifty-50' },
        { text: 'NIFTY BANK', href: '/indices/nifty-bank' },
        { text: 'BSE Smallcap', href: '/indices/bse-smallcap' },
        { text: 'S&P 500', href: '/indices/sp-500' },
        { text: 'NIFTY Midcap 100', href: '/indices/nifty-midcap-100' },
        { text: 'SIP Calculator', href: '/calculators/sip-calculator' },
        { text: 'Brokerage Calculator', href: '/calculators/brokerage-calculator' },
        { text: 'Margin Calculator', href: '/calculators/margin-calculator' },
        { text: 'Upcoming IPO', href: '/ipo/upcoming-ipo' },
      ];

      elements.forEach((element) => {
        cy.contains('p', element.text)
          .should('be.visible')
          .parent('div')
          .parent('a')
          .should('have.attr', 'href', element.href)
          .then(($a) => {
            const href = $a.attr('href');
            failed_urls = [];
            cy.checkRequestStatus(href).then((failedUrl) => {
              if (failedUrl == null) {
                return;
              } else {
                failed_urls.push(failedUrl);
              }
            });

            cy.wrap($a).click();

            cy.url().should('include', href);

            cy.go('back');
          });
      });
    });
    it('FAQ', () => {
      //FAQ
      cy.get('.accordion.accordionCard').should('be.visible').should('exist');
      cy.get('.accordion.accordionCard h3')
        .should('have.length.gt', 0)
        .then(() => {
          cy.get('.accordion.accordionCard h3').each(($el) => {
            cy.wrap($el).find('.barlow_body.question-faq').should('not.be.empty');
            cy.wrap($el).scrollIntoView();
            cy.wrap($el)
              .click({ force: true })
              .then(() => {
                cy.get('.accordion-collapse.collapse.show').should('be.visible').should('exist').should('not.be.empty');
              });
          });
        });
      //cy.get('')
    });
  });
  after(() => {
    cy.saveErrorLogs(cyLogsArray);
  });
});
