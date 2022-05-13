import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';
import { Card, CardWrapper } from '../../../components/Modal/styles';

// tslint:disable-next-line:variable-name
const ShowKeyboardShortcutsStyle = styled(PopupBody)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
  padding: 2rem 3.2rem 0 3.2rem;
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
const ShortcutsHeadingStyle = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${theme.color.text.default};
  background-color: ${theme.color.neutral.darkest};
  height: 3.2rem;
  width: 100%;
  padding: 0 3.2rem;
  display: flex;
  align-items: center;
`;

export const ShortcutsHeading = ({msgKey}: {msgKey: string}) => (
  <ShortcutsHeadingStyle>
    <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
      {(msg) => msg}
    </FormattedMessage>
  </ShortcutsHeadingStyle>
);

const ShortcutStyle = styled.div`
  font-size: 1.4rem;
  color: ${theme.color.text.default};
  background-color: ${theme.color.neutral.darkest};
  height: 3.2rem;
  width: 100%;
  padding: 0 3.2rem;
  display: flex;
  align-items: center;
`;

export const ShortcutKeyStyle = styled.span`
  border: 0.2rem solid @gray-lighter;
`;

// Using the index as the key is not ideal but this content is static so it shouldn't matter
export const Shortcut = ({keys, msgKey}: {keys: string[], msgKey: string}) => (
  <ShortcutStyle>
    {keys.map<React.ReactNode>((k, index) => <ShortcutKeyStyle key={index}>{k}</ShortcutKeyStyle>)
         .reduce((prev, curr) => [prev, ' + ', curr])}

    <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
      {(msg) => msg}
    </FormattedMessage>
  </ShortcutStyle>
);

// tslint:disable-next-line: variable-name
const ShowKeyboardShortcuts = () => (
  <ShowKeyboardShortcutsStyle
    data-testid='show-practice-questions-body'
    data-analytics-region='KS popup'
  >
    <ShortcutsHeading msgKey="sub-heading"/>

    <CardWrapper>
      <Card>
        <Shortcut keys={["shift", "?"]} msgKey="open-menu"/>
        <Shortcut keys={["tab"]} msgKey="move-forward"/>
        <Shortcut keys={["shift", "tab"]} msgKey="move-backward"/>
        <Shortcut keys={["h"]} msgKey="move-focus-in-out"/>
        <Shortcut keys={["tab"]} msgKey="move-through-note-editing"/>
        <Shortcut keys={["space"]} msgKey="select-highlight-color"/>
        <Shortcut keys={["enter"]} msgKey="save-or-cancel"/>
      </Card>
    </CardWrapper>

    <ShortcutsHeading msgKey="creating-highlights-and-notes"/>

    <FormattedMessage id='i18n:a11y:keyboard-shortcuts:caret-extension'>
      {(msg) => msg}
    </FormattedMessage>

    <CardWrapper>
      <Card>
        <Shortcut keys={["arrows"]} msgKey="move-forward"/>
        <Shortcut keys={["shift", "arrows"]} msgKey="move-backward"/>
        <Shortcut keys={["h"]} msgKey="move-focus-in-out"/>
        <Shortcut keys={["tab"]} msgKey="move-through-note-editing"/>
        <Shortcut keys={["space"]} msgKey="select-highlight-color"/>
        <Shortcut keys={["enter"]} msgKey="save-or-cancel"/>
      </Card>
    </CardWrapper>
  </ShowKeyboardShortcutsStyle>
);

export default ShowKeyboardShortcuts;
