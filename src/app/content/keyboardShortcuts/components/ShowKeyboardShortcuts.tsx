import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { htmlMessage } from '../../../components/htmlMessage';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';

// tslint:disable-next-line:variable-name
const ShowKeyboardShortcutsBody = styled(PopupBody)`
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
const ShortcutsHeadingDiv = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 3rem;
  ${theme.breakpoints.mobile(css`
    font-size: 1.6rem;
    line-height: 2.5rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const ShortcutsHeading = ({msgKey}: {msgKey: string}) => (
  <ShortcutsHeadingDiv>
    <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
      {(msg) => msg}
    </FormattedMessage>
  </ShortcutsHeadingDiv>
);

// tslint:disable-next-line: variable-name
const ShortcutsCard = styled.div`
  background-color: ${theme.color.white};
  border: 1px solid ${theme.color.neutral.darkest};
  margin: 2rem 0;
  padding: 2.4rem;
  ${theme.breakpoints.mobile(css`
    margin: 1.6rem 0;
    padding: 0.8rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const ShortcutBlock = styled.div`
  display: inline-block;
  margin: 0.8rem;
  min-width: 17.6rem;
  vertical-align: middle;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

// tslint:disable-next-line: variable-name
export const ShortcutKey = styled.span`
  background-color: ${theme.color.neutral.darker};
  border: 1px solid ${theme.color.neutral.formBorder};
  border-radius: 3px;
  display: inline-block;
  font-weight: bold;
  padding: 0.4rem 1.2rem 0.3rem;
  vertical-align: middle;
`;

// tslint:disable-next-line: variable-name
export const Shortcut = ({keys, msgKey}: {keys: string[], msgKey: string}) => (
  <div>
    <ShortcutBlock>
      {keys.map<React.ReactNode>(
        (k, index) => <ShortcutKey key={index}>
          <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:keys:${k}`}>
            {(msg) => msg}
          </FormattedMessage>
        </ShortcutKey>
      ).reduce((prev, curr) => [prev, ' + ', curr])}
    </ShortcutBlock>

    <ShortcutBlock>
      <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
        {(msg) => msg}
      </FormattedMessage>
    </ShortcutBlock>
  </div>
);

// tslint:disable-next-line: variable-name
const CaretMessageDiv = styled.div`
  /* Nothing here at the moment */
`;

// tslint:disable-next-line: variable-name
export const CaretMessage = htmlMessage(
  'i18n:a11y:keyboard-shortcuts:caret-extension', CaretMessageDiv
);

// tslint:disable-next-line: variable-name
const ShowKeyboardShortcuts = () => (
  <ShowKeyboardShortcutsBody
    data-testid='show-keyboard-shortcuts-body'
    data-analytics-region='KS popup'
  >
    <ShortcutsHeading msgKey='sub-heading'/>

    <ShortcutsCard>
      <Shortcut keys={['shift', '?']} msgKey='open-menu'/>
      <Shortcut keys={['tab']} msgKey='move-forward'/>
      <Shortcut keys={['shift', 'tab']} msgKey='move-backward'/>
      <Shortcut keys={['h']} msgKey='move-focus-in-out'/>
      <Shortcut keys={['tab']} msgKey='move-through-note-editing'/>
      <Shortcut keys={['space']} msgKey='select-highlight-color'/>
      <Shortcut keys={['enter']} msgKey='save-or-cancel'/>
    </ShortcutsCard>

    <ShortcutsHeading msgKey='creating-highlights-and-notes'/>

    <CaretMessage/>

    <ShortcutsCard>
      <Shortcut keys={['arrows']} msgKey='move-forward'/>
      <Shortcut keys={['shift', 'arrows']} msgKey='move-backward'/>
      <Shortcut keys={['h']} msgKey='move-focus-in-out'/>
      <Shortcut keys={['tab']} msgKey='move-through-note-editing'/>
      <Shortcut keys={['space']} msgKey='select-highlight-color'/>
      <Shortcut keys={['enter']} msgKey='save-or-cancel'/>
    </ShortcutsCard>
  </ShowKeyboardShortcutsBody>
);

export default ShowKeyboardShortcuts;
