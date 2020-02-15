const fs = require('fs')
const expect = require('chai').expect
const Potemkin = require('../../../../client/client')
const request = require('request-promise-native')

let potemkin;

describe('unsplash.com', () => {
  before(() => {
    potemkin = new Potemkin();
  });

  it('should should render proposed search terms', async () => {
    await potemkin.setPatterns([{
      urlPattern: 'https://unsplash.com/nautocomplete/snow',
      method: 'GET',
      mockResponse: JSON.stringify({
        autocomplete: [{
          query: 'snowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnowsnow',
        }]
      })
    }]);

    await browser.url('https://unsplash.com/');
    const search = await $('#SEARCH_FORM_INPUT_homepage-header-big');
    await search.setValue('snow');
    await browser.pause(1000);
    const suggestions = await $$("//li[@data-suggestion-index]");
    expect(suggestions.length).to.equal(1);

    // expect(await suggestions[0].getText()).to.equal('Thats what I expected');
  })
})