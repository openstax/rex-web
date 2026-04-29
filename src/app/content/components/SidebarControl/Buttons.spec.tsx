import React from 'react';
import renderer from 'react-test-renderer';
import { OpenButton, CloseButton } from './Buttons';

describe('Buttons', () => {
  describe('OpenButton', () => {
    it('sets data-active to false when both isActive and isOpen are undefined', () => {
      const component = renderer.create(
        <OpenButton>Test Button</OpenButton>
      );

      const button = component.root.findByType('button');
      expect(button.props['data-active']).toBe(false);
    });

    it('sets data-active to false when isActive is undefined and isOpen is null', () => {
      const component = renderer.create(
        <OpenButton isOpen={null}>Test Button</OpenButton>
      );

      const button = component.root.findByType('button');
      expect(button.props['data-active']).toBe(false);
    });

    it('sets data-active based on isOpen when isActive is undefined', () => {
      const component = renderer.create(
        <OpenButton isOpen={true}>Test Button</OpenButton>
      );

      const button = component.root.findByType('button');
      expect(button.props['data-active']).toBe(true);
    });

    it('sets data-active based on isActive when provided', () => {
      const component = renderer.create(
        <OpenButton isActive={true} isOpen={false}>Test Button</OpenButton>
      );

      const button = component.root.findByType('button');
      expect(button.props['data-active']).toBe(true);
    });

    it('sets data-active to false when isActive is false', () => {
      const component = renderer.create(
        <OpenButton isActive={false} isOpen={true}>Test Button</OpenButton>
      );

      const button = component.root.findByType('button');
      expect(button.props['data-active']).toBe(false);
    });

    it('applies base className when no className prop is provided', () => {
      const component = renderer.create(
        <OpenButton>Test Button</OpenButton>
      );

      const button = component.root.findByType('button');
      expect(button.props.className).toBe('sidebar-control-open-button');
    });

    it('merges base className with consumer className when className prop is provided', () => {
      const component = renderer.create(
        <OpenButton className="custom-class">Test Button</OpenButton>
      );

      const button = component.root.findByType('button');
      expect(button.props.className).toBe('sidebar-control-open-button custom-class');
    });
  });

  describe('CloseButton', () => {
    it('applies base className when no className prop is provided', () => {
      const component = renderer.create(
        <CloseButton>Close</CloseButton>
      );

      const button = component.root.findByType('button');
      expect(button.props.className).toBe('sidebar-control-close-button');
    });

    it('merges base className with consumer className when className prop is provided', () => {
      const component = renderer.create(
        <CloseButton className="custom-close-class">Close</CloseButton>
      );

      const button = component.root.findByType('button');
      expect(button.props.className).toBe('sidebar-control-close-button custom-close-class');
    });
  });
});
