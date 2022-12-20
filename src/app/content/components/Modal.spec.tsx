import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
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
        if (typeof ref !== 'function' && ref?.current) { focusSpy = jest.spyOn(ref.current, 'focus'); }
        modalContext.focusModal();
        setDeleted(true);
      };

      return deleted ? null : <span/>;
    };

    it('focuses the Modal when it exists', () => {
      const { node } = renderToDom(
        <TestContainer>
          <Modal ref={ref}>
            <DeletableChild/>
          </Modal>
        </TestContainer>
      );
      let child = node.querySelector('span');
      expect(child).not.toBeNull();

      act(deleteChild);

      child = node.querySelector('span');
      expect(child).toBeNull();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('does nothing and does not explode if the Modal does not exist', () => {
      const { node } = renderToDom(
        <TestContainer>
          <div>
            <DeletableChild/>
          </div>
        </TestContainer>
      );
      let child = node.querySelector('span');
      expect(child).not.toBeNull();

      act(deleteChild);

      child = node.querySelector('span');
      expect(child).toBeNull();

      expect(focusSpy).not.toHaveBeenCalled();
    });

    it('does nothing and does not explode if ref is a function', () => {
      const { node } = renderToDom(
        <TestContainer>
          <Modal ref={() => null}>
            <DeletableChild/>
          </Modal>
        </TestContainer>
      );
      let child = node.querySelector('span');
      expect(child).not.toBeNull();

      act(deleteChild);

      child = node.querySelector('span');
      expect(child).toBeNull();

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });
});
