const request = require('request-promise-native')
const fs = require('fs')
const expect = require('chai').expect
const potemkin = require('../../../../client/client')

describe('unsplash.com', () => {
  it('should should render proposed search terms', async () => {
    await new Promise((resolve, reject) => {
      const pattern = {
        urlPattern: 'https://unsplash.com/nautocomplete/snow',
        method: 'GET',
        mockResponse: fs.readFileSync(`${__dirname}/snow.json`, 'utf-8')
      };

      request('http://localhost:1774/api/patterns', {
        method: 'POST',
        json: [pattern]
      },
        async (err, response, body) => {
          if (err) {
            reject();
          } else {
            resolve();
          }
        }
      );
    });

    await browser.url('https://unsplash.com/');
    const search = await $('#SEARCH_FORM_INPUT_homepage-header-big');
    await search.setValue('snow');
    await browser.pause(1000);
    const suggestions = await $$("//li[@data-suggestion-index]");
    expect(suggestions.length).to.equal(5);

    /*
    expect(await suggestions[0].getText()).to.equal('snow');
    expect(await suggestions[1].getText()).to.equal('snowboarding');
    expect(await suggestions[2].getText()).to.equal('snowboard');
    expect(await suggestions[3].getText()).to.equal('snowing');
    expect(await suggestions[4].getText()).to.equal('snowflake');
    */

    // await suggestions[0].click();
    // const title = await $("<h1>");
    // expect(await title.getText()).to.equal('Snow');
  })
})