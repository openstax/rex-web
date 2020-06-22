import { Document, HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import * as reactUtils from '../../../reactUtils';
import { Store } from '../../../types';
import { assertDocument } from '../../../utils';
import * as studyGuidesSelect from '../../studyGuides/selectors';
import { nudgeStudyToolsTargetId } from './constants';
import * as utils from './utils';

describe('useGetStudyToolsTarget', () => {
  let document: Document;
  let target: HTMLElement;
  let store: Store;
  // tslint:disable-next-line: variable-name
  let Component: () => JSX.Element;

  beforeEach(() => {
    document = assertDocument();
    target = document.createElement('div');
    target.setAttribute('id', nudgeStudyToolsTargetId);
    jest.spyOn(target, 'getBoundingClientRect')
      .mockReturnValue({ top: 100, left: 200, right: 300, height: 40, width: 300, bottom: 200 });
    document.body.appendChild(target);

    store = createTestStore();
    Component = () => {
      const targetElement = utils.useGetStudyToolsTarget();
      return <React.Fragment>
        {
          targetElement
          ? `id: ${targetElement.getAttribute('id')}, ${targetElement.toString()}`
          : null
        }
      </React.Fragment>;
    };
  });

  afterEach(() => {
    target.remove();
  });

  it('return target if has study guides', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(true);

    const component = renderer.create(<Provider store={store}>
      <Component />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('return null if there are no study guides', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(false);

    const component = renderer.create(<Provider store={store}>
      <Component />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe('usePositions', () => {
  let document: Document;
  let target: HTMLElement;
  let store: Store;
  // tslint:disable-next-line: variable-name
  let Component: (props: { isMobile: boolean }) => JSX.Element;

  beforeEach(() => {
    document = assertDocument();
    target = document.createElement('div');
    target.setAttribute('id', nudgeStudyToolsTargetId);
    jest.spyOn(target, 'getBoundingClientRect')
      .mockReturnValue({ top: 100, left: 200, right: 300, height: 40, width: 300, bottom: 200 });
    document.body.appendChild(target);

    store = createTestStore();
    Component = (props) => {
      const positions = utils.usePositions(props.isMobile);
      return <React.Fragment>
        {JSON.stringify(positions)}
      </React.Fragment>;
    };
  });

  afterEach(() => {
    target.remove();
  });

  it('return null if target was not found', () => {
    target.remove();

    const component = renderer.create(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();

    // assign target so afterEach not throw an error
    target = document.createElement('div');
  });

  it('returns different positions depends on isMobile and windowWidth', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(true);

    jest.spyOn(reactUtils, 'useDebouncedWindowSize')
      .mockReturnValueOnce([1900])
      .mockReturnValueOnce([1900])
      .mockReturnValueOnce([1900])
      .mockReturnValue([1200]);

    const component = renderer.create(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    component.update(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();

    component.update(<Provider store={store}>
      <Component isMobile={true} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();

    component.update(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
