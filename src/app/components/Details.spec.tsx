import React from 'react';
import renderer from 'react-test-renderer';
import { Details, Summary, ExpandIcon, CollapseIcon } from './Details';

describe('Details components', () => {
  describe('Details', () => {
    it('renders correctly with children', () => {
      const component = renderer.create(
        <Details>
          <Summary>Click to expand</Summary>
          <p>Hidden content</p>
        </Details>
      );

      expect(component.toJSON()).toMatchSnapshot();
    });

    it('applies custom className', () => {
      const component = renderer.create(
        <Details className="custom-class">
          <Summary>Test</Summary>
        </Details>
      );

      expect(component.toJSON()).toMatchSnapshot();
    });

    it('spreads additional props', () => {
      const component = renderer.create(
        <Details id="test-id" data-testid="details-test">
          <Summary>Test</Summary>
        </Details>
      );

      const tree = component.toJSON() as any;
      expect(tree.props.id).toBe('test-id');
      expect(tree.props['data-testid']).toBe('details-test');
    });
  });

  describe('Summary', () => {
    it('renders correctly with children', () => {
      const component = renderer.create(
        <Summary>Click to expand</Summary>
      );

      expect(component.toJSON()).toMatchSnapshot();
    });

    it('applies custom className', () => {
      const component = renderer.create(
        <Summary className="custom-summary">Test content</Summary>
      );

      const tree = component.toJSON() as any;
      expect(tree.props.className).toContain('details-summary');
      expect(tree.props.className).toContain('custom-summary');
    });

    it('spreads additional props', () => {
      const component = renderer.create(
        <Summary id="summary-id" aria-label="Expand section">
          Test
        </Summary>
      );

      const tree = component.toJSON() as any;
      expect(tree.props.id).toBe('summary-id');
      expect(tree.props['aria-label']).toBe('Expand section');
    });

    it('handles onClick event', () => {
      const handleClick = jest.fn();
      const component = renderer.create(
        <Summary onClick={handleClick}>Test</Summary>
      );

      renderer.act(() => {
        component.root.findByType('summary').props.onClick();
      });

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('ExpandIcon', () => {
    it('renders correctly', () => {
      const component = renderer.create(<ExpandIcon />);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it('applies custom className', () => {
      const component = renderer.create(<ExpandIcon className="custom-icon" />);
      const tree = component.toJSON() as any;

      expect(tree.props.className).toContain('details-expand-icon');
      expect(tree.props.className).toContain('custom-icon');
    });
  });

  describe('CollapseIcon', () => {
    it('renders correctly', () => {
      const component = renderer.create(<CollapseIcon />);
      expect(component.toJSON()).toMatchSnapshot();
    });

    it('applies custom className', () => {
      const component = renderer.create(<CollapseIcon className="custom-icon" />);
      const tree = component.toJSON() as any;

      expect(tree.props.className).toContain('details-collapse-icon');
      expect(tree.props.className).toContain('custom-icon');
    });
  });
});
