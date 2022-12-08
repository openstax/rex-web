import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { findDOMNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { renderToDom } from '../../../test/reactutils';
import TestContainer from '../../../test/TestContainer';
import Modal, { ModalContext } from './Modal';

describe('ModalContext', () => {
  describe('focusModal', () => {
    let focusSpy: jest.SpyInstance = jest.fn();
    let ref: React.Ref<HTMLElement>;
    let deleteChild: () => void;

    beforeEach(() => {
      focusSpy = jest.fn();
      ref = React.createRef<HTMLElement>();
      deleteChild = () => undefined;
    });

    // tslint:disable-next-line: variable-name
    const DeletableChild = () => {
      const [deleted, setDeleted] = React.useState<boolean>(false);
      const modalContext = React.useContext(ModalContext);

      deleteChild = () => {
        if (ref && typeof ref !== 'function' && ref.current) { focusSpy = jest.spyOn(ref.current, 'focus'); }
        modalContext.focusModal();
        setDeleted(true);
      };

      return deleted ? null : <span/>;
    };

    it('focuses the Modal when it exists', () => {
      const { tree } = renderToDom(
        <TestContainer>
          <Modal ref={ref}>
            <DeletableChild/>
          </Modal>
        </TestContainer>
      );
      let node = findDOMNode(tree).querySelector('span');
      expect(node).not.toBeNull();

      act(deleteChild);

      node = findDOMNode(tree).querySelector('span');
      expect(node).toBeNull();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('does nothing and does not explode if the Modal does not exist', () => {
      const { tree } = renderToDom(
        <TestContainer>
          <DeletableChild/>
        </TestContainer>
      );
      let node = findDOMNode(tree);
      expect(node).not.toBeNull();

      act(deleteChild);

      node = findDOMNode(tree);
      expect(node).toBeNull();

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });
});
