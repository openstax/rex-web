import React from 'react';
import renderer from 'react-test-renderer';
import Modal from '.';
import TestContainer from '../../../test/TestContainer';

/**
 * NOTE ON TRAILING SPACES IN SNAPSHOTS:
 *
 * The snapshot tests may show trailing spaces in className attributes (e.g., "modal-body ").
 * This is a test artifact caused by Jest's snapshot serialization process.
 *
 * Explanation:
 * - The legacy styled-components wrappers (styles.legacy.tsx) wrap plain components using styled()
 * - These wrappers generate styled-components class names like "styleslegacy__Body-m93cxn-6 dmUpwe"
 * - During snapshot serialization, Jest strips out these generated styled-components classes
 * - This leaves the original "modal-body" class with a trailing space where the styled class was
 *
 * Example:
 * - Runtime className: "modal-body styleslegacy__Body-m93cxn-6 dmUpwe"
 * - After Jest stripping: "modal-body "
 *
 * This does NOT occur in actual runtime - browsers receive the full className with both the base
 * class and styled-components classes. The trailing space only appears in test snapshots.
 *
 * This artifact will resolve itself once the legacy styled-components wrappers are removed in
 * future migration phases.
 */

describe('Modal', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <Modal
        onModalClose={() => null}
        heading='i18n:discard:heading'
      />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const component = renderer.create(<TestContainer>
      <Modal
        onModalClose={() => null}
        heading='i18n:discard:heading'
      >
        <div>child 1</div>
        <div>child 2</div>
      </Modal>
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
