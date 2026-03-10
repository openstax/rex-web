import React from 'react';
import renderer from 'react-test-renderer';
import { H1, H2, H3, H4, H5, H6 } from './Headings';

describe('Typography Headings', () => {
  describe('H1', () => {
    it('matches snapshot', () => {
      const component = renderer.create(<H1>Test Heading 1</H1>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom className', () => {
      const component = renderer.create(<H1 className="custom-class">Test Heading 1</H1>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom style', () => {
      const component = renderer.create(<H1 style={{ color: 'red' }}>Test Heading 1</H1>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with additional props', () => {
      const component = renderer.create(<H1 id="test-id" data-testid="h1">Test Heading 1</H1>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('H2', () => {
    it('matches snapshot', () => {
      const component = renderer.create(<H2>Test Heading 2</H2>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom className', () => {
      const component = renderer.create(<H2 className="custom-class">Test Heading 2</H2>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom style', () => {
      const component = renderer.create(<H2 style={{ color: 'blue' }}>Test Heading 2</H2>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('H3', () => {
    it('matches snapshot', () => {
      const component = renderer.create(<H3>Test Heading 3</H3>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom className', () => {
      const component = renderer.create(<H3 className="custom-class">Test Heading 3</H3>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom style', () => {
      const component = renderer.create(<H3 style={{ color: 'green' }}>Test Heading 3</H3>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('H4', () => {
    it('matches snapshot', () => {
      const component = renderer.create(<H4>Test Heading 4</H4>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom className', () => {
      const component = renderer.create(<H4 className="custom-class">Test Heading 4</H4>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom style', () => {
      const component = renderer.create(<H4 style={{ fontWeight: 'bold' }}>Test Heading 4</H4>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with additional props', () => {
      const component = renderer.create(<H4 id="test-h4" role="heading">Test Heading 4</H4>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('H5', () => {
    it('matches snapshot', () => {
      const component = renderer.create(<H5>Test Heading 5</H5>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom className', () => {
      const component = renderer.create(<H5 className="custom-class">Test Heading 5</H5>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom style', () => {
      const component = renderer.create(<H5 style={{ textTransform: 'uppercase' }}>Test Heading 5</H5>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with additional props', () => {
      const component = renderer.create(<H5 id="test-h5" aria-label="Heading 5">Test Heading 5</H5>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('H6', () => {
    it('matches snapshot', () => {
      const component = renderer.create(<H6>Test Heading 6</H6>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom className', () => {
      const component = renderer.create(<H6 className="custom-class">Test Heading 6</H6>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with custom style', () => {
      const component = renderer.create(<H6 style={{ letterSpacing: '0.1rem' }}>Test Heading 6</H6>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('renders with additional props', () => {
      const component = renderer.create(<H6 id="test-h6" data-testid="heading-6">Test Heading 6</H6>);
      const tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
