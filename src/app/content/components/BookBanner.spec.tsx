import React from 'react';
import renderer from 'react-test-renderer';
import { finishRender, navigate } from '../../../test/browserutils';
import { book as archiveBook, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBookFields } from '../../../test/mocks/osWebLoader';
import { formatBookData } from '../utils';
import { BookBanner } from './BookBanner';

const book = formatBookData(archiveBook, mockCmsBookFields);

const TEST_PAGE_NAME = 'test-page-1';
const TEST_PAGE_URL = `/books/book-slug-1/pages/${TEST_PAGE_NAME}`;

describe('BookBanner', () => {

  it('renders `null` with no page or book', () => {
    const component = renderer.create(<BookBanner />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when you pass a page and book', () => {
    const component = renderer.create(<BookBanner page={shortPage} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders `null` when passed a page that isn\'t in the book tree', () => {
    const pageNotInTree = {...shortPage, id: 'asdfasdfasd'};
    const component = renderer.create(<BookBanner page={pageNotInTree} book={book} />);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when title fits one line on mobile', async() => {
    page.setViewport({height: 731, width: 411});
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      if (h1) {
        h1.innerHTML = '<span class=\'os - text\'>chapter text here</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title fits two lines without truncation on mobile', async() => {
    page.setViewport({height: 731, width: 411});
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>The First Law of Thermodynamics and Some Simple Processes</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title truncates after two lines on mobile', async() => {
    page.setViewport({height: 731, width: 411});
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      const text = 'Statistical Interpretation of Entropy and the Second Law of Thermodynamics: The Underlying Explanation';
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>' + text + '</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title fits without truncation on desktop', async() => {
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      const text = 'Energy and the Simple Harmonic Oscillator';
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>' + text + '</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

  it('renders correctly when title truncates after one line on desktop', async() => {
    await navigate(page, TEST_PAGE_URL);
    await page.evaluate(() => {
      const h1 = document && document.querySelector('h1');
      const text = 'Statistical Interpretation of Entropy and the Second Law of Thermodynamics: The Underlying Explanation';
      if (h1) {
        h1.innerHTML = '<span class=\'os-text\'>' + text + '</span>';
      }
    });
    await finishRender(page);
    const screen = await page.screenshot();
    expect(screen).toMatchImageSnapshot({
      CI: {
        failureThreshold: 1.5,
        failureThresholdType: 'percent',
      },
    });

  });

});
