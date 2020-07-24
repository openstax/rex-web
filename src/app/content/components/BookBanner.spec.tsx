import React from 'react';
import renderer from 'react-test-renderer';
import { book as archiveBook, shortPage } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { renderToDom } from '../../../test/reactutils';
import { resetModules } from '../../../test/utils';
import { assertWindow } from '../../utils';
import { formatBookData } from '../utils';
import { findArchiveTreeNodeById } from '../utils/archiveTreeUtils';
import { BarWrapper, PropTypes } from './BookBanner';

const book = formatBookData(archiveBook, mockCmsBook);
const bookWithoutOsWebData = formatBookData(archiveBook, undefined);
const pageNode = findArchiveTreeNodeById(archiveBook.tree, shortPage.id)!;

describe('BookBanner', () => {
  let window: Window;
  let event: React.MouseEvent;
  let assign: jest.SpyInstance;
  // tslint:disable-next-line:variable-name
  let BookBanner: React.ComponentType<PropTypes>;

  beforeEach(() => {
    resetModules();

    window = assertWindow();
    delete window.location;

    window.location = {
      assign: jest.fn(),
    } as any as Window['location'];

    event = {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      preventDefault: jest.fn(),
      shiftKey: false,
    } as any as React.MouseEvent;

    assign = jest.spyOn(window.location, 'assign');
  });

  describe('without unsaved changes', () => {
    beforeEach(() => {
      BookBanner = require('./BookBanner').BookBanner;
    });

    it('renders empty state with no page or book', () => {
      const component = renderer.create(<BookBanner />);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly when you pass a page and book', () => {
      const component = renderer.create(<BookBanner pageNode={pageNode} book={book} />);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly without osweb data', () => {
      const component = renderer.create(<BookBanner pageNode={pageNode} book={bookWithoutOsWebData} />);

      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('does not stop default navigation event', async() => {
      const component = renderer.create(<BookBanner pageNode={pageNode} book={book} hasUnsavedHighlight={false} />);

      const link = component.root.findByProps({'data-testid': 'details-link-expanded'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('mounts in a dom', () => {
      expect(() => renderToDom(<BookBanner pageNode={pageNode} book={book} />)).not.toThrow();
    });

    it('wrapper transition matches snapshot', () => {
      const component = renderer.create(<BarWrapper colorSchema='blue' up={true} />);
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe('with unsaved changes', () => {
    const mockConfirmation = jest.fn()
      .mockImplementationOnce(() =>  new Promise((resolve) => resolve(true)))
      .mockImplementationOnce(() =>  new Promise((resolve) => resolve(false)));

    jest.mock(
      '../highlights/components/utils/showConfirmation',
      () => mockConfirmation
    );

    beforeEach(() => {
      BookBanner = require('./BookBanner').BookBanner;
    });

    it('redirects if users chooses to discard', async() => {
      const component = renderer.create(<BookBanner pageNode={pageNode} book={book} hasUnsavedHighlight={true} />);

      const link = component.root.findByProps({'data-testid': 'details-link-expanded'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(assign).toHaveBeenCalled();
    });

    it('noops if users chooses not to discard', async() => {
      const component = renderer.create(<BookBanner pageNode={pageNode} book={book} hasUnsavedHighlight={true} />);

      const link = component.root.findByProps({'data-testid': 'details-link-collapsed'});

      await renderer.act(() => {
        link.props.onClick(event);
        return Promise.resolve();
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(assign).not.toHaveBeenCalled();
    });
  });
});
