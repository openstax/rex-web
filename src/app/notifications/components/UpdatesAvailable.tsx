import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css } from 'styled-components/macro';
import Button, { ButtonGroup } from '../../components/Button';
import { maxNavWidth } from '../../components/NavBar';
import { bodyCopyRegularStyle } from '../../components/Typography';
import theme from '../../theme';

// tslint:disable-next-line:variable-name
const Group = styled.div`
  width: 100%;
  ${(props) => props.setInlineStyle(css`
    display: flex;
    flex-direction: column;
    justify-content: center;
  `)}
`;

// tslint:disable-next-line:variable-name
const P = styled.p`
  ${bodyCopyRegularStyle}
  margin: 0;
  padding: 1rem;
  ${(props) => props.setInlineStyle(css`
    padding: 0 1rem 0 0;
  `)}
`;

// tslint:disable-next-line:variable-name
const Body = styled.div`
  margin: 0.5rem;
  background-color: ${theme.color.neutral.base};
  border-style: solid;
  border-color: ${theme.color.neutral.darkest};
  display: flex;
  flex-basis: 100%;
  flex-direction: column;
  border-width: thin;
  box-shadow: 0 1rem 2rem 0 rgba(0, 0, 0, 0.2);
  overflow: visible;
  ${(props) => props.setInlineStyle(css`
    max-width: ${maxNavWidth}rem;
    margin: 0 auto;
    box-shadow: none;
    border: none;
    flex-direction: row;
  `)}

  > ${ButtonGroup} {
    padding: 1rem;
    margin: 0;
    ${(props) => props.setInlineStyle(css`
      padding: 1rem 0;
    `)}
  }
`;

// tslint:disable-next-line:variable-name
const Header = styled.div`
  ${bodyCopyRegularStyle}
  padding: 0.5rem 1rem;
  font-weight: bold;
  background-color: ${theme.color.neutral.darker};
  line-height: 4rem;
  margin-bottom: 1rem;
  ${(props) => props.setInlineStyle(css`
    padding-left: 0;
    line-height: 1rem;
    margin: 0;
    background-color: initial;
  `)}
`;

const reload = () => {
  if (typeof(window) !== 'undefined') {
    window.location.reload(true);
  }
};

interface UpdatesAvailableProps {setInlineStyle: (style: FlattenSimpleInterpolation) => FlattenSimpleInterpolation; }
// tslint:disable-next-line:variable-name
const UpdatesAvailable: SFC<UpdatesAvailableProps> = ({setInlineStyle}) => <Body setInlineStyle={setInlineStyle}>
  <Group setInlineStyle={setInlineStyle}>
    <FormattedMessage id='i18n:notification:update:header'>
      {(txt) => (<Header setInlineStyle={setInlineStyle}>{txt}</Header>)}
    </FormattedMessage>
    <FormattedMessage id='i18n:notification:update:body'>
      {(txt) => (<P setInlineStyle={setInlineStyle}>{txt}</P>)}
    </FormattedMessage>
  </Group>
  <ButtonGroup>
    <FormattedMessage id='i18n:notification:update:reload'>
      {(txt) => (<Button variant='primary' onClick={reload}>{txt}</Button>)}
    </FormattedMessage>
  </ButtonGroup>
</Body>;

export default UpdatesAvailable;
