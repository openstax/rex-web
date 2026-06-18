import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { htmlMessage } from '../../../components/htmlMessage';
import theme from '../../../theme';
import { headerHeight, popupHeaderZIndex } from '../../styles/PopupConstants';
import './ShowKeyboardShortcuts.css';

interface ShowKeyboardShortcutsBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ShowKeyboardShortcutsBody component - plain CSS version
 */
export function ShowKeyboardShortcutsBody({ className, style, ...domProps }: ShowKeyboardShortcutsBodyProps) {

  return (
    <div
      {...domProps}
      className={classNames('popup-body', 'keyboard-shortcuts-body', className)}
      style={{
        '--keyboard-shortcuts-body-bg': theme.color.neutral.darker,
        '--keyboard-shortcuts-text-color': theme.color.text.default,
        '--shortcuts-card-bg': theme.color.white,
        '--shortcuts-card-border': theme.color.neutral.darkest,
        '--shortcut-key-bg': theme.color.neutral.darker,
        '--shortcut-key-border': theme.color.neutral.formBorder,
        '--keyboard-shortcuts-header-height': `${headerHeight}rem`,
        '--keyboard-shortcuts-z-index': popupHeaderZIndex - 1,
        ...style,
      } as React.CSSProperties}
    />
  );
}

interface ShortcutsHeadingDivProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ShortcutsHeadingDiv component - plain CSS version
 */
export function ShortcutsHeadingDiv({ className, ...domProps }: ShortcutsHeadingDivProps) {

  return (
    <div
      {...domProps}
      className={classNames('keyboard-shortcuts-heading', className)}
    />
  );
}

export const ShortcutsHeading = ({ msgKey }: { msgKey: string }) => (
  <ShortcutsHeadingDiv>
    <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
      {(msg) => msg}
    </FormattedMessage>
  </ShortcutsHeadingDiv>
);

interface ShortcutsCardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ShortcutsCard component - plain CSS version
 */
export function ShortcutsCard({ className, ...domProps }: ShortcutsCardProps) {

  return (
    <div
      {...domProps}
      className={classNames('keyboard-shortcuts-card', className)}
    />
  );
}

interface ShortcutsTableProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ShortcutsTable component - plain CSS version
 */
export function ShortcutsTable({ className, ...domProps }: ShortcutsTableProps) {

  return (
    <div
      {...domProps}
      className={classNames('keyboard-shortcuts-table', className)}
    />
  );
}

interface ShortcutRowProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ShortcutRow component - plain CSS version
 */
export function ShortcutRow({ className, ...domProps }: ShortcutRowProps) {

  return (
    <div
      {...domProps}
      className={classNames('keyboard-shortcut-row', className)}
    />
  );
}

interface ShortcutBlockProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ShortcutBlock component - plain CSS version
 */
export function ShortcutBlock({ className, ...domProps }: ShortcutBlockProps) {

  return (
    <div
      {...domProps}
      className={classNames('keyboard-shortcut-block', className)}
    />
  );
}

interface ShortcutKeyProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * ShortcutKey component - plain CSS version
 */
export function ShortcutKey({ className, ...domProps }: ShortcutKeyProps) {

  return (
    <span
      {...domProps}
      className={classNames('keyboard-shortcut-key', className)}
    />
  );
}

export const Shortcut = ({ keys, msgKey, separator = ' + ' }: { keys: string[], msgKey: string, separator?: string }) => (
  <ShortcutRow>
    <ShortcutBlock>
      {keys.map<React.ReactNode>(
        (k, index) => <ShortcutKey key={index}>
          <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:keys:${k}`}>
            {(msg) => msg}
          </FormattedMessage>
        </ShortcutKey>
      ).reduce((prev, curr) => [prev, separator, curr])}
    </ShortcutBlock>

    <ShortcutBlock>
      <FormattedMessage id={`i18n:a11y:keyboard-shortcuts:${msgKey}`}>
        {(msg) => msg}
      </FormattedMessage>
    </ShortcutBlock>
  </ShortcutRow>
);

/**
 * CaretMessageDiv component - plain CSS version
 */
export function CaretMessageDiv({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={classNames('keyboard-shortcuts-caret-message', className)}
    />
  );
}

export const CaretMessage = htmlMessage(
  'i18n:a11y:keyboard-shortcuts:caret-browsing', CaretMessageDiv
);

const ShowKeyboardShortcuts = () => (
  <ShowKeyboardShortcutsBody
    data-testid='show-keyboard-shortcuts-body'
    data-analytics-region='KS popup'
    tabIndex={-1}
  >
    <ShortcutsHeading msgKey='sub-heading' />

    <ShortcutsCard>
      <ShortcutsTable>
        <Shortcut keys={['shift', '?']} msgKey='open-menu' />
        <Shortcut keys={['tab']} msgKey='move-forward' />
        <Shortcut keys={['shift', 'tab']} msgKey='move-backward' />
        <Shortcut keys={['alt', 'h']} msgKey='move-focus-in-out' />
        <Shortcut keys={['tab']} msgKey='move-through-note-editing' />
        <Shortcut keys={['arrows']} msgKey='select-highlight-color' />
        <Shortcut keys={['enter']} msgKey='save-or-cancel' />
      </ShortcutsTable>
    </ShortcutsCard>

    <ShortcutsHeading msgKey='creating-highlights-and-notes' />

    <CaretMessage />

    <ShortcutsCard>
      <ShortcutsTable>
        <Shortcut keys={['arrows']} msgKey='move-focus-through-each-line' />
        <Shortcut keys={['shift', 'arrows']} msgKey='select-text' />
        <Shortcut keys={['alt', 'h']} msgKey='create-highlight-or-note' />
        <Shortcut keys={['alt', 's']} msgKey='cycle-search-regions' />
      </ShortcutsTable>
    </ShortcutsCard>

    <ShortcutsHeading msgKey='math-equations-interaction' />

    <ShortcutsCard>
      <ShortcutsTable>
        <Shortcut keys={['tab']} msgKey='math-focus-equation' />
        <Shortcut keys={['shift', 'tab']} msgKey='math-focus-equation-backward' />
        <Shortcut keys={['space', 'enter']} msgKey='math-open-context-menu' separator=' or ' />
        <Shortcut keys={['shift', 'f10']} msgKey='math-open-context-menu-nvda-win' />
        <Shortcut keys={['ctrl', 'enter']} msgKey='math-open-context-menu-nvda-mac' />
      </ShortcutsTable>
    </ShortcutsCard>
  </ShowKeyboardShortcutsBody>
);

export default ShowKeyboardShortcuts;
