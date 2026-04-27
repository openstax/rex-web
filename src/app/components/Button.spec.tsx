import React from 'react';
import renderer from 'react-test-renderer';
import Button from './Button';
import { ButtonGroup, ButtonLink, PlainButton } from './Button';

describe('Button', () => {
  it('matches snapshot - link', () => {
    const component = renderer.create(<Button component={<a href='/' />}>this is a link</Button>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - small', () => {
    const component = renderer.create(<Button size='small' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - medium', () => {
    const component = renderer.create(<Button size='medium' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - large', () => {
    const component = renderer.create(<Button size='large' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - primary', () => {
    const component = renderer.create(<Button variant='primary' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - secondary', () => {
    const component = renderer.create(<Button variant='secondary' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - default', () => {
    const component = renderer.create(<Button variant='default' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - transparent', () => {
    const component = renderer.create(<Button variant='transparent' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - disabled', () => {
    const component = renderer.create(<Button disabled />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - with custom className', () => {
    const component = renderer.create(<Button className='custom-class' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - with custom style', () => {
    const component = renderer.create(<Button style={{ marginTop: '10px' }} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - with children', () => {
    const component = renderer.create(<Button>Click me</Button>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - polymorphic with input component', () => {
    const component = renderer.create(<Button component={<input type='button' value='Submit' />} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - polymorphic with input component disabled', () => {
    const component = renderer.create(<Button component={<input type='button' value='Submit' />} disabled />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - polymorphic with anchor component disabled', () => {
    const component = renderer.create(<Button component={<a href='/' />} disabled>Link</Button>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - polymorphic with div component disabled', () => {
    const component = renderer.create(<Button component={<div role='button' />} disabled>Div Button</Button>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('polymorphic disabled onClick handler', () => {
    it('prevents default and stops propagation on click', () => {
      const onClick = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' onClick={jest.fn()} />} disabled onClick={onClick}>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onClick) {
        tree.props.onClick(event);
      }

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('does not call original onClick from component prop when disabled', () => {
      const componentOnClick = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' onClick={componentOnClick} />} disabled>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onClick) {
        tree.props.onClick(event);
      }

      expect(componentOnClick).not.toHaveBeenCalled();
    });

    it('does not call onClick from Button props when disabled', () => {
      const buttonOnClick = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' />} disabled onClick={buttonOnClick}>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onClick) {
        tree.props.onClick(event);
      }

      expect(buttonOnClick).not.toHaveBeenCalled();
    });

    it('does not call any onClick handlers when disabled', () => {
      const componentOnClick = jest.fn();
      const buttonOnClick = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' onClick={componentOnClick} />} disabled onClick={buttonOnClick}>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onClick) {
        tree.props.onClick(event);
      }

      expect(componentOnClick).not.toHaveBeenCalled();
      expect(buttonOnClick).not.toHaveBeenCalled();
    });

    it('handles missing onClick handlers gracefully when disabled', () => {
      const component = renderer.create(
        <Button component={<a href='/' />} disabled>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.MouseEvent<HTMLElement>;

      // Should not throw when no onClick handlers are present
      expect(() => {
        if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onClick) {
          tree.props.onClick(event);
        }
      }).not.toThrow();

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('polymorphic disabled onKeyDown handler', () => {
    it('prevents default and stops propagation for Enter key', () => {
      const onKeyDown = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' onKeyDown={jest.fn()} />} disabled onKeyDown={onKeyDown}>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        key: 'Enter',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onKeyDown) {
        tree.props.onKeyDown(event);
      }

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      // Original handlers should NOT be called for Enter/Space
      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('prevents default and stops propagation for Space key', () => {
      const onKeyDown = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' onKeyDown={jest.fn()} />} disabled onKeyDown={onKeyDown}>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        key: ' ',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onKeyDown) {
        tree.props.onKeyDown(event);
      }

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      // Original handlers should NOT be called for Enter/Space
      expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('calls original onKeyDown from component prop for non-activation keys', () => {
      const componentOnKeyDown = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' onKeyDown={componentOnKeyDown} />} disabled>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        key: 'Escape',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onKeyDown) {
        tree.props.onKeyDown(event);
      }

      expect(componentOnKeyDown).toHaveBeenCalledWith(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('calls onKeyDown from Button props for non-activation keys', () => {
      const buttonOnKeyDown = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' />} disabled onKeyDown={buttonOnKeyDown}>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        key: 'Tab',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onKeyDown) {
        tree.props.onKeyDown(event);
      }

      expect(buttonOnKeyDown).toHaveBeenCalledWith(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('calls both onKeyDown handlers for non-activation keys', () => {
      const componentOnKeyDown = jest.fn();
      const buttonOnKeyDown = jest.fn();
      const component = renderer.create(
        <Button component={<a href='/' onKeyDown={componentOnKeyDown} />} disabled onKeyDown={buttonOnKeyDown}>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        key: 'ArrowDown',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onKeyDown) {
        tree.props.onKeyDown(event);
      }

      expect(componentOnKeyDown).toHaveBeenCalledWith(event);
      expect(buttonOnKeyDown).toHaveBeenCalledWith(event);
    });

    it('handles missing onKeyDown handlers gracefully for non-activation keys', () => {
      const component = renderer.create(
        <Button component={<a href='/' />} disabled>Link</Button>
      );
      const tree = component.toJSON();

      const event = {
        key: 'Escape',
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      // Should not throw when no onKeyDown handlers are present
      expect(() => {
        if (tree && typeof tree === 'object' && 'props' in tree && tree.props.onKeyDown) {
          tree.props.onKeyDown(event);
        }
      }).not.toThrow();

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});

describe('PlainButton', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<PlainButton />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - with className', () => {
    const component = renderer.create(<PlainButton className='custom' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - with children', () => {
    const component = renderer.create(<PlainButton>Click</PlainButton>);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('filters out transient props (props starting with $)', () => {
    // Transient props (starting with $) should not be forwarded to the DOM
    // This is a styled-components convention for style-only props
    const component = renderer.create(
      <PlainButton
        {...({ $isActive: true } as any)}
        data-testid="test-button"
      >
        Click
      </PlainButton>
    );
    const tree = component.toJSON();

    // Verify the button was rendered
    expect(tree).toBeTruthy();
    if (tree && typeof tree === 'object' && 'props' in tree) {
      // Verify standard props are present
      expect(tree.props['data-testid']).toBe('test-button');
      // Verify transient prop was filtered out
      expect(tree.props['$isActive']).toBeUndefined();
    }
  });
});

describe('ButtonLink', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<ButtonLink />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot (decorated)', () => {
    const component = renderer.create(<ButtonLink decorated />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot (decorated and disabled)', () => {
    const component = renderer.create(<ButtonLink decorated disabled />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - with className', () => {
    const component = renderer.create(<ButtonLink className='custom' />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('ButtonGroup', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<ButtonGroup />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot (expand)', () => {
    const component = renderer.create(<ButtonGroup expand />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot (not-expand)', () => {
    const component = renderer.create(<ButtonGroup expand={false} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot (vertical)', () => {
    const component = renderer.create(<ButtonGroup vertical />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot (vertical and not-expand)', () => {
    const component = renderer.create(<ButtonGroup vertical expand={false} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot - with children', () => {
    const component = renderer.create(
      <ButtonGroup>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
      </ButtonGroup>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
