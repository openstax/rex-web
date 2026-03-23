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
