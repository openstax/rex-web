import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import * as Services from '../../app/context/Services';
import { useAnalyticsEvent } from '.';
import createTestStore from '../../test/createTestStore';
import TestContainer from '../../test/TestContainer';

const TrackComponent = ({ eventType, onTrack }: {
  eventType: Parameters<typeof useAnalyticsEvent>[0];
  onTrack: (track: (...args: any[]) => void) => void;
}) => {
  const track = useAnalyticsEvent(eventType);
  onTrack(track);
  return null;
};

describe('useAnalyticsEvent', () => {
  it('returns a callable tracker when analytics service is available', () => {
    let trackFn: ((...args: any[]) => void) | undefined;

    renderer.create(
      <TestContainer>
        <TrackComponent
          eventType='openCloseKeyboardShortcuts'
          onTrack={(fn) => { trackFn = fn; }}
        />
      </TestContainer>
    );

    expect(trackFn).toBeDefined();
    expect(() => trackFn!()).not.toThrow();
  });

  it('returns a no-op tracker when analytics service is not available', () => {
    const store = createTestStore();
    let trackFn: ((...args: any[]) => void) | undefined;

    // Render with an empty services context (no analytics property),
    // as happens when a component renders outside the services provider
    renderer.create(
      <Provider store={store}>
        <Services.Provider value={{} as any}>
          <TrackComponent
            eventType='openCloseKeyboardShortcuts'
            onTrack={(fn) => { trackFn = fn; }}
          />
        </Services.Provider>
      </Provider>
    );

    expect(trackFn).toBeDefined();
    expect(() => trackFn!()).not.toThrow();
  });
});
