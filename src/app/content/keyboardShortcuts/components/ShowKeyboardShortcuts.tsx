import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { htmlMessage } from '../../../components/htmlMessage';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';

// tslint:disable-next-line:variable-name
const ShowKeyboardShortcutsStyle = styled(PopupBody)`
  background-color: ${theme.color.neutral.darker};
  color: ${theme.color.text.default};
  font-size: 1.6rem;
  line-height: 2.5rem;
  padding: 2rem 3.2rem 3.2rem 3.2rem;
  ${theme.breakpoints.mobile(css`
    padding: 1.6rem;
    text-align: left;
  `)}
`;

// tslint:disable-next-line: variable-name
const ShortcutsHeadingStyle = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
    line-height: 3rem;
  ${theme.breakpoints.mobile(css`
    font-size: 1.6rem;
    line-height: 2.5rem;
  `)}
`;

export const ShortcutsHeading = ({msgKey}: {msgKey: string}) => (
  <ShortcutsHeadingStyle>
    <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
      {(msg) => msg}
    </FormattedMessage>
  </ShortcutsHeadingStyle>
);

export const ShortcutsCard = styled.div`
  background-color: ${theme.color.white};
  border: 1px solid ${theme.color.neutral.darkest};
  margin: 2rem 0;
  padding: 1.6rem 3.2rem;
  ${theme.breakpoints.mobile(css`
    margin: 1.6rem 0;
  `)}
`;

const ShortcutStyle = styled.div`
  align-items: center;
  display: flex;
  align-items: center;
  margin: 1.6rem 0;
  width: 100%;
`;

export const ShortcutKeyStyle = styled.span`
  background-color: ${theme.color.neutral.darker};
  border: 1px solid ${theme.color.neutral.formBorder};
  border-radius: 3px;
  padding: 0.4rem 1.2rem 0.3rem;
`;

// Using the index as the key is not ideal but this content is static so it shouldn't matter
export const Shortcut = ({keys, msgKey}: {keys: string[], msgKey: string}) => (
  <ShortcutStyle>
    {keys.map<React.ReactNode>(
      (k, index) => <ShortcutKeyStyle key={index}>
        <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:keys:${k}`}>
          {(msg) => msg}
        </FormattedMessage>
      </ShortcutKeyStyle>
    ).reduce((prev, curr) => [prev, ' + ', curr])}

    <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
      {(msg) => msg}
    </FormattedMessage>
  </ShortcutStyle>
);

export const CaretMessageStyle = styled.div``;

export const CaretMessage = htmlMessage(
  'i18n:a11y:keyboard-shortcuts:caret-extension', CaretMessageStyle
);

// tslint:disable-next-line: variable-name
const ShowKeyboardShortcuts = () => (
  <ShowKeyboardShortcutsStyle
    data-testid='show-keyboard-shortcuts-body'
    data-analytics-region='KS popup'
  >
    <ShortcutsHeading msgKey="sub-heading"/>

    <ShortcutsCard>
      <Shortcut keys={["shift", "?"]} msgKey="open-menu"/>
      <Shortcut keys={["tab"]} msgKey="move-forward"/>
      <Shortcut keys={["shift", "tab"]} msgKey="move-backward"/>
      <Shortcut keys={["h"]} msgKey="move-focus-in-out"/>
      <Shortcut keys={["tab"]} msgKey="move-through-note-editing"/>
      <Shortcut keys={["space"]} msgKey="select-highlight-color"/>
      <Shortcut keys={["enter"]} msgKey="save-or-cancel"/>
    </ShortcutsCard>

    <ShortcutsHeading msgKey="creating-highlights-and-notes"/>

    <CaretMessage/>

    <ShortcutsCard>
      <Shortcut keys={["arrows"]} msgKey="move-forward"/>
      <Shortcut keys={["shift", "arrows"]} msgKey="move-backward"/>
      <Shortcut keys={["h"]} msgKey="move-focus-in-out"/>
      <Shortcut keys={["tab"]} msgKey="move-through-note-editing"/>
      <Shortcut keys={["space"]} msgKey="select-highlight-color"/>
      <Shortcut keys={["enter"]} msgKey="save-or-cancel"/>
    </ShortcutsCard>
  </ShowKeyboardShortcutsStyle>
);

export default ShowKeyboardShortcuts;
