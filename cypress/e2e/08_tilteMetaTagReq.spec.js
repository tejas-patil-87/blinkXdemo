describe('HTML response assertions', () => {
  it('should make a request and assert on the HTML response for company pages', () => {
    const footerStockLinks = require('../fixtures/footerDetails.json');
    let urlsForTest = footerStockLinks.topStocksList.map((stock) => stock.href);
    urlsForTest.push('/stocks/teerth-gopicon-ltd', '/stocks/jm-financial-ltd', '/stocks/umiya-tubes-ltd', '/stocks/shriram-city-union-finance-ltd');

    urlsForTest.forEach((urlForTest) => {
      context(`Testing on URL: ${Cypress.env('UAT')}blinkx.in${urlForTest}`, () => {
        let baseUrl = `https://${Cypress.env('UAT')}blinkx.in`;
        let fullUrl = `${baseUrl}${urlForTest}`;
        cy.request('GET', fullUrl).then((response) => {
          expect(response.status).to.eq(200);

          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(response.body, 'text/html');

          const CompanyName = htmlDoc.querySelector('h1.symbol-head')?.textContent.trim();
          const title = htmlDoc.querySelector('title');
          expect(title).to.not.be.null;
          expect(title.textContent).to.eq(`${CompanyName} Share Price Today - Stock Price Live - NSE/BSE | BlinkX`);

          const metaDescription = htmlDoc.querySelector('meta[name="description"]');
          expect(metaDescription).to.not.be.null;
          expect(metaDescription.getAttribute('content')).to.eq(
            `${CompanyName} share price today - Get ${CompanyName} live NSE/BSE stock price with fundamentals, latest news, profit & loss, share holding, company profile, peer comparison at BlinkX.`,
          );

          const canonicalLink = htmlDoc.querySelector('link[rel="canonical"]');
          expect(canonicalLink).to.not.be.null;
          expect(canonicalLink.getAttribute('href')).to.eq(fullUrl);

          const schema = htmlDoc.querySelector('script[type="application/ld+json"]');
          expect(schema).to.not.be.null;

          const schemaContent = JSON.parse(schema.textContent);
          expect(schemaContent).to.be.an('array');

          const foundTypes = {
            WebPage: false,
            FAQPage: false,
            BreadcrumbList: false,
          };

          schemaContent.forEach((item) => {
            if (item['@type'] in foundTypes) {
              foundTypes[item['@type']] = true;
            }

            if (item['@type'] === 'WebPage') {
              expect(item).to.have.property('name', `${CompanyName} Share Price Today, Live Updates | blinkX`);
              expect(item.publisher).to.have.property('@type', 'Organization');
              expect(item.publisher).to.have.property('name', 'blinkX');
              expect(item.publisher).to.have.property('url', 'https://blinkx.in');
            }

            if (item['@type'] === 'FAQPage') {
              expect(item).to.have.property('mainEntity').that.is.an('array');
              item.mainEntity.forEach((faq) => {
                expect(faq).to.have.property('@type', 'Question');
                expect(faq).to.have.property('name').that.is.a('string');
                expect(faq).to.have.property('acceptedAnswer').that.is.an('object');
                expect(faq.acceptedAnswer).to.have.property('@type', 'Answer');
                expect(faq.acceptedAnswer).to.have.property('text').that.is.a('string');
              });
            }

            if (item['@type'] === 'BreadcrumbList') {
              expect(item).to.have.property('itemListElement').that.is.an('array');
              item.itemListElement.forEach((listItem, index) => {
                expect(listItem).to.have.property('@type', 'ListItem');
                expect(listItem).to.have.property('position', index + 1);
                expect(listItem).to.have.property('name').that.is.a('string');
                expect(listItem).to.have.property('item').that.is.a('string');
              });
            }
          });

          expect(foundTypes.WebPage).to.be.true;
          expect(foundTypes.FAQPage && foundTypes.BreadcrumbList).to.be.true;
        });
      });
    });
  });
  it.only('should make a request and assert on the HTML response for indices pages', () => {
    const footerStockLinks = require('../fixtures/footerDetails.json');
    let urlsForTest = footerStockLinks.topIndicesList.map((stock) => stock.href);
    urlsForTest.push();

    urlsForTest.forEach((urlForTest) => {
      context(`Testing on URL: ${Cypress.env('UAT')}blinkx.in${urlForTest}`, () => {
        let baseUrl = `https://${Cypress.env('UAT')}blinkx.in`;
        let fullUrl = `${baseUrl}${urlForTest}`;
        cy.log(fullUrl+"?test=123")
        cy.request('GET', fullUrl).then((response) => {
          expect(response.status).to.eq(200);

          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(response.body, 'text/html');

          const CompanyName = htmlDoc.querySelector('.company-name-title')?.textContent.trim() || htmlDoc.querySelector('.upc')?.textContent.trim()
          const title = htmlDoc.querySelector('title');
          expect(title).to.not.be.null;
          expect(title.textContent).to.eq(`${CompanyName} : Share Price, Live Charts & Latest Updates | BlinkX`)

          const metaDescription = htmlDoc.querySelector('meta[name="description"]');
          expect(metaDescription).to.not.be.null;
          expect(metaDescription.getAttribute('content')).to.eq(
            `Explore ${CompanyName} indices, benchmarks reflecting Indian stock market performance. Monitor sectors, stocks, and market trends for informed investment decisions.`,
          );

          const canonicalLink = htmlDoc.querySelector('link[rel="canonical"]');
          expect(canonicalLink).to.not.be.null;
          expect(canonicalLink.getAttribute('href')).to.eq(fullUrl);

          const schema = htmlDoc.querySelector('script[type="application/ld+json"]');
          expect(schema).to.not.be.null;

          const schemaContent = JSON.parse(schema.textContent);
          expect(schemaContent).to.be.an('array');

          const foundTypes = {
            WebPage: false,
            FAQPage: false,
            BreadcrumbList: false,
          };

          schemaContent.forEach((item) => {
            if (item['@type'] in foundTypes) {
              foundTypes[item['@type']] = true;
            }

            if (item['@type'] === 'WebPage') {
              expect(item).to.have.property('name', `${CompanyName} : Share Price, Live Charts & Latest Updates | BlinkX`);
              expect(item.publisher).to.have.property('@type', 'Organization');
              expect(item.publisher).to.have.property('name', 'blinkX');
              expect(item.publisher).to.have.property('url', 'https://blinkx.in');
            }

            if (item['@type'] === 'FAQPage') {
              expect(item).to.have.property('mainEntity').that.is.an('array');
              item.mainEntity.forEach((faq) => {
                expect(faq).to.have.property('@type', 'Question');
                expect(faq).to.have.property('name').that.is.a('string');
                expect(faq).to.have.property('acceptedAnswer').that.is.an('object');
                expect(faq.acceptedAnswer).to.have.property('@type', 'Answer');
                expect(faq.acceptedAnswer).to.have.property('text').that.is.a('string');
              });
            }

            if (item['@type'] === 'BreadcrumbList') {
              expect(item).to.have.property('itemListElement').that.is.an('array');
              item.itemListElement.forEach((listItem, index) => {
                expect(listItem).to.have.property('@type', 'ListItem');
                expect(listItem).to.have.property('position', index + 1);
                expect(listItem).to.have.property('name').that.is.a('string');
                expect(listItem).to.have.property('item').that.is.a('string');
              });
            }
          });
          expect(foundTypes.WebPage).to.be.true;
          expect(foundTypes.FAQPage && foundTypes.BreadcrumbList).to.be.true;
        });
      });
    });
  });
});
