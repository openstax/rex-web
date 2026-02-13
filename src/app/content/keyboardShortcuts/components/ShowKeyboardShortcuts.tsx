import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { htmlMessage } from '../../../components/htmlMessage';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';

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

const ShortcutsHeadingDiv = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  line-height: 3rem;
  ${theme.breakpoints.mobile(css`
    font-size: 1.6rem;
    line-height: 2.5rem;
  `)}
`;

export const ShortcutsHeading = ({msgKey}: {msgKey: string}) => (
  <ShortcutsHeadingDiv>
    <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
      {(msg: string) => msg}
    </FormattedMessage>
  </ShortcutsHeadingDiv>
);

const ShortcutsCard = styled.div`
  background-color: ${theme.color.white};
  border: 1px solid ${theme.color.neutral.darkest};
  margin: 2rem 0;
  padding: 1.6rem 0;
  width: 100%;
  ${theme.breakpoints.mobile(css`
    margin: 1.6rem 0;
    padding: 0.8rem;
  `)}
`;

const ShortcutsTable = styled.div`
  border-collapse: separate;
  border-spacing: 3.2rem 1.6rem;
  display: table;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

const ShortcutRow = styled.div`
  display: table-row;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

const ShortcutBlock = styled.div`
  display: table-cell;
  min-width: 16rem;
  vertical-align: middle;
  ${theme.breakpoints.mobile(css`
    display: block;
    margin: 0.8rem;
  `)}
`;

export const ShortcutKey = styled.span`
  background-color: ${theme.color.neutral.darker};
  border: 1px solid ${theme.color.neutral.formBorder};
  border-radius: 3px;
  display: inline-block;
  font-weight: bold;
  padding: 0.4rem 1.2rem 0.3rem;
  vertical-align: middle;
`;

export const Shortcut = ({keys, msgKey}: {keys: string[], msgKey: string}) => (
  <ShortcutRow>
    <ShortcutBlock>
      {keys.map<React.ReactNode>(
        (k, index) => <ShortcutKey key={index}>
          <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:keys:${k}`}>
            {(msg: string) => msg}
          </FormattedMessage>
        </ShortcutKey>
      ).reduce((prev, curr) => [prev, ' + ', curr])}
    </ShortcutBlock>

    <ShortcutBlock>
      <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
        {(msg: string) => msg}
      </FormattedMessage>
    </ShortcutBlock>
  </ShortcutRow>
);

const CaretMessageDiv = styled.div`
  /* Nothing here at the moment */
`;

export const CaretMessage = htmlMessage(
  'i18n:a11y:keyboard-shortcuts:caret-browsing', CaretMessageDiv
);

const ShowKeyboardShortcuts = () => (
  <ShowKeyboardShortcutsBody
    data-testid='show-keyboard-shortcuts-body'
    data-analytics-region='KS popup'
    tabIndex={-1}
  >
    <ShortcutsHeading msgKey='sub-heading'/>

    <ShortcutsCard>
      <ShortcutsTable>
        <Shortcut keys={['shift', '?']} msgKey='open-menu'/>
        <Shortcut keys={['tab']} msgKey='move-forward'/>
        <Shortcut keys={['shift', 'tab']} msgKey='move-backward'/>
        <Shortcut keys={['alt', 'h']} msgKey='move-focus-in-out'/>
        <Shortcut keys={['tab']} msgKey='move-through-note-editing'/>
        <Shortcut keys={['arrows']} msgKey='select-highlight-color'/>
        <Shortcut keys={['enter']} msgKey='save-or-cancel'/>
      </ShortcutsTable>
    </ShortcutsCard>

    <ShortcutsHeading msgKey='creating-highlights-and-notes'/>

    <CaretMessage/>

    <ShortcutsCard>
      <ShortcutsTable>
        <Shortcut keys={['arrows']} msgKey='move-focus-through-each-line'/>
        <Shortcut keys={['shift', 'arrows']} msgKey='select-text'/>
        <Shortcut keys={['alt', 'h']} msgKey='create-highlight-or-note'/>
        <Shortcut keys={['alt', 's']} msgKey='cycle-search-regions'/>
      </ShortcutsTable>
    </ShortcutsCard>
  </ShowKeyboardShortcutsBody>
);

export default ShowKeyboardShortcuts;
