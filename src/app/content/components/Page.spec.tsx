import React from 'react';
import renderer from 'react-test-renderer';
import { typesetMath } from '../../../helpers/mathjax';
import Page from './Page';

jest.mock('../../../helpers/mathjax');

describe('Page', () => {
  it('renders math', () => {
    renderer.create(<Page content='asdf' key='page' />, {
      createNodeMock: () => document && document.createElement('div'),
    });

    expect(typesetMath).toHaveBeenCalled();
  });
});
