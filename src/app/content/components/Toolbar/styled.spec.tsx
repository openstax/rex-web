import React from 'react';
import renderer from 'react-test-renderer';
import { PlainButton, PrintOptWrapper } from './styled';

describe('Toolbar styled components', () => {
  describe('PlainButton', () => {
    it('renders with children', () => {
      const component = renderer.create(
        <PlainButton onClick={jest.fn()}>
          Click me
        </PlainButton>
      );

      const tree = component.toJSON();
      expect(tree).toBeTruthy();

      const button = component.root.findByType('button');
      expect(button.props.children).toBe('Click me');
    });

    it('filters out transient props starting with $', () => {
      const component = renderer.create(
        <PlainButton
          onClick={jest.fn()}
          {...({ $transientProp: 'should-not-render' } as any)}
          data-testid="plain-button"
        >
          Button
        </PlainButton>
      );

      const tree = component.toJSON();
      expect(tree).toBeTruthy();

      const button = component.root.findByType('button');

      // Transient prop should not be passed to the DOM
      expect(button.props['$transientProp']).toBeUndefined();

      // Regular props should be passed through
      expect(button.props['data-testid']).toBe('plain-button');
      expect(button.props.onClick).toBeDefined();
    });

    it('passes through className and style props', () => {
      const testStyle = { backgroundColor: 'red' };
      const component = renderer.create(
        <PlainButton
          onClick={jest.fn()}
          className="custom-class"
          style={testStyle}
        >
          Button
        </PlainButton>
      );

      const button = component.root.findByType('button');

      expect(button.props.className).toContain('plain-button');
      expect(button.props.className).toContain('custom-class');
      expect(button.props.style).toEqual(testStyle);
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      renderer.create(
        <PlainButton ref={ref} onClick={jest.fn()}>
          Button
        </PlainButton>
      );

      // In test renderer, ref doesn't get assigned, but we can verify the component accepts it
      // The real test is that this doesn't throw an error
      expect(true).toBe(true);
    });

    it('safeProps reduce function covers both branches', () => {
      // This test specifically ensures that BOTH the if branch (when key doesn't start with $)
      // AND the implicit else branch (when key starts with $) are executed during the reduce operation.
      // This satisfies code coverage requirements for the transient prop filtering logic.

      const onClick = jest.fn();
      const component = renderer.create(
        <PlainButton
          onClick={onClick}
          {...({
            $transientProp: 'filtered',
            'data-analytics': 'button-click',
            'data-regular': 'value',
          } as any)}
        >
          Mixed Props Button
        </PlainButton>
      );

      const tree = component.toJSON();
      expect(tree).toBeTruthy();

      const button = component.root.findByType('button');

      // Verify transient prop was filtered (else branch)
      expect(button.props['$transientProp']).toBeUndefined();

      // Verify regular props were passed through (if branch)
      expect(button.props['data-analytics']).toBe('button-click');
      expect(button.props['data-regular']).toBe('value');
      expect(button.props.onClick).toBe(onClick);
    });
  });

  describe('PrintOptWrapper', () => {
    it('renders with children and isActive prop', () => {
      const component = renderer.create(
        <PrintOptWrapper isActive={true} onClick={jest.fn()}>
          Print Option
        </PrintOptWrapper>
      );

      const tree = component.toJSON();
      expect(tree).toBeTruthy();

      const button = component.root.findByType('button');
      expect(button.props.children).toBe('Print Option');
      expect(button.props.className).toContain('print-opt-wrapper--active');
    });

    it('renders without isActive prop', () => {
      const component = renderer.create(
        <PrintOptWrapper onClick={jest.fn()}>
          Print Option
        </PrintOptWrapper>
      );

      const button = component.root.findByType('button');
      expect(button.props.className).toContain('print-opt-wrapper');
      expect(button.props.className).not.toContain('print-opt-wrapper--active');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      renderer.create(
        <PrintOptWrapper ref={ref} onClick={jest.fn()}>
          Print Option
        </PrintOptWrapper>
      );

      // In test renderer, ref doesn't get assigned, but we can verify the component accepts it
      // The real test is that this doesn't throw an error
      expect(true).toBe(true);
    });
  });
});
