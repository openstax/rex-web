import React from 'react';
import renderer from 'react-test-renderer';
import { DecoratedLink } from './Links';

describe('DecoratedLink', () => {
  describe('snapshots', () => {
    it('matches snapshot - basic', () => {
      const component = renderer.create(
        <DecoratedLink href="/test">Test Link</DecoratedLink>
      );
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot - with className', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" className="custom-class">
          Test Link
        </DecoratedLink>
      );
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot - with style', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" style={{ fontSize: '16px' }}>
          Test Link
        </DecoratedLink>
      );
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot - disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" disabled>
          Disabled Link
        </DecoratedLink>
      );
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('matches snapshot - with additional props', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" id="test-link" data-testid="link">
          Test Link
        </DecoratedLink>
      );
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('handleClick behavior', () => {
    it('calls onClick when not disabled', () => {
      const onClick = jest.fn();
      const component = renderer.create(
        <DecoratedLink href="/test" onClick={onClick}>
          Test Link
        </DecoratedLink>
      );

      const mockEvent = {
        preventDefault: jest.fn(),
      };

      renderer.act(() => {
        component.root.findByType('a').props.onClick(mockEvent);
      });

      expect(onClick).toHaveBeenCalledWith(mockEvent);
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('prevents default and does not call onClick when disabled', () => {
      const onClick = jest.fn();
      const component = renderer.create(
        <DecoratedLink href="/test" onClick={onClick} disabled>
          Test Link
        </DecoratedLink>
      );

      const mockEvent = {
        preventDefault: jest.fn(),
      };

      renderer.act(() => {
        component.root.findByType('a').props.onClick(mockEvent);
      });

      expect(onClick).not.toHaveBeenCalled();
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('handles click without onClick prop when not disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test">Test Link</DecoratedLink>
      );

      const mockEvent = {
        preventDefault: jest.fn(),
      };

      renderer.act(() => {
        component.root.findByType('a').props.onClick(mockEvent);
      });

      // Should not throw and preventDefault should not be called
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('handles click without onClick prop when disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" disabled>
          Test Link
        </DecoratedLink>
      );

      const mockEvent = {
        preventDefault: jest.fn(),
      };

      renderer.act(() => {
        component.root.findByType('a').props.onClick(mockEvent);
      });

      // Should prevent default when disabled
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('removes href when disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" disabled>
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.href).toBeUndefined();
    });

    it('keeps href when not disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test">Test Link</DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.href).toBe('/test');
    });

    it('sets tabIndex to -1 when disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" disabled>
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.tabIndex).toBe(-1);
    });

    it('preserves custom tabIndex when not disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" tabIndex={2}>
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.tabIndex).toBe(2);
    });

    it('uses undefined tabIndex by default when not disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test">Test Link</DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.tabIndex).toBeUndefined();
    });

    it('sets aria-disabled to true when disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" disabled>
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props['aria-disabled']).toBe(true);
    });

    it('sets aria-disabled to undefined when not disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test">Test Link</DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props['aria-disabled']).toBeUndefined();
    });

    it('applies disabled class when disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" disabled>
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.className).toContain('decorated-link-style--disabled');
    });

    it('does not apply disabled class when not disabled', () => {
      const component = renderer.create(
        <DecoratedLink href="/test">Test Link</DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.className).not.toContain('decorated-link-style--disabled');
    });
  });

  describe('className composition', () => {
    it('combines default and custom classNames', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" className="custom-class">
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.className).toContain('decorated-link-style');
      expect(link.props.className).toContain('custom-class');
    });

    it('combines default, disabled, and custom classNames', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" className="custom-class" disabled>
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.className).toContain('decorated-link-style');
      expect(link.props.className).toContain('decorated-link-style--disabled');
      expect(link.props.className).toContain('custom-class');
    });
  });

  describe('style prop', () => {
    it('merges custom style with CSS variable', () => {
      const component = renderer.create(
        <DecoratedLink href="/test" style={{ fontSize: '20px' }}>
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.style).toHaveProperty('fontSize', '20px');
      expect(link.props.style).toHaveProperty('--text-color');
    });

    it('sets CSS variable for text color', () => {
      const component = renderer.create(
        <DecoratedLink href="/test">Test Link</DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.style).toHaveProperty('--text-color');
    });
  });

  describe('props spreading', () => {
    it('spreads additional props to the anchor element', () => {
      const component = renderer.create(
        <DecoratedLink
          href="/test"
          id="test-link"
          data-testid="link"
          aria-label="Test Link"
        >
          Test Link
        </DecoratedLink>
      );

      const link = component.root.findByType('a');
      expect(link.props.id).toBe('test-link');
      expect(link.props['data-testid']).toBe('link');
      expect(link.props['aria-label']).toBe('Test Link');
    });
  });
});
