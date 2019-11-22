import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../../../../MessageProvider';
import Filters from './Filters';

jest.mock('./ColorFilter', () => (props: any) => <div mock-color-filter {...props} />);
jest.mock('./ChapterFilter', () => (props: any) => <div mock-chapter-filter {...props} />);

describe('Filters', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Filters />
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
