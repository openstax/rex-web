import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import StudyGuidesCTA from '.';
import createTestStore from '../../../../../test/createTestStore';
import { receiveLoggedOut, receiveUser } from '../../../../auth/actions';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import * as Styled from './styles';

describe('StudyGuidesCTA', () => {
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
  });

  it('does not render if user is logged in', () => {
    store.dispatch(receiveUser({} as any));

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <StudyGuidesCTA />
      </MessageProvider>
    </Provider>);

    expect(() => component.root.findByType(Styled.StudyGuidesCTAWrapper)).toThrow();
  });

  it('does render if user is not logged in', () => {
    store.dispatch(receiveLoggedOut());

    const component = renderer.create(<Provider store={store}>
      <MessageProvider>
        <StudyGuidesCTA />
      </MessageProvider>
    </Provider>);

    expect(() => component.root.findByType(Styled.StudyGuidesCTAWrapper)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTAContent)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTATitle)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTAButtons)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTAButton)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTASeparator)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTALink)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTAArrow)).not.toThrow();
    expect(() => component.root.findByType(Styled.StudyGuidesCTAInfo)).not.toThrow();
  });
});
