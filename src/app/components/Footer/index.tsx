import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useAnalyticsEvent } from '../../../helpers/analytics';
import { openKeyboardShortcutsMenu as openKeyboardShortcutsMenuAction } from '../../content/keyboardShortcuts/actions';
import htmlMessage from '../../components/htmlMessage';
import { isVerticalNavOpenConnector } from '../../content/components/utils/sidebar';
import { State } from '../../content/types';
import * as selectNavigation from '../../navigation/selectors';
import * as guards from '../../guards';
import { captureOpeningElement } from '../../content/utils/focusManager';
import { ManageCookiesLink as RawCookiesLink } from '@openstax/ui-components';
import { SocialDirectory } from './SocialIcons';
import { ContactDialog, useContactDialog } from './ContactDialog';
import { assertWindow } from '../../utils';
import './Footer.css';

// Constants
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
export const supportCenterLink = 'https://help.openstax.org/s/';
const systemStatusLink = 'https://status.openstax.org/';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';

/**
 * Helper function to safely construct rel attribute for links.
 * Ensures noopener and noreferrer are present for target="_blank" links
 * to prevent reverse-tabnabbing and referrer leakage.
 *
 * @param target - The target attribute value
 * @param rel - Optional existing rel attribute value
 * @returns Normalized rel attribute string
 */
export function getSafeRelAttribute(target: string | undefined, rel: string | undefined): string {
  // Normalize rel tokens and ensure safe defaults for links opened in a new tab
  const relTokens = new Set((rel || '').split(/\s+/).filter(Boolean));

  if (target === '_blank') {
    relTokens.add('noopener');
    relTokens.add('noreferrer');
  }

  return Array.from(relTokens).join(' ');
}

// Plain div wrappers for htmlMessage
const MissionDiv = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('footer-mission', className)} {...props}>{children}</div>
);

const CopyrightsDiv = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('footer-copyrights', className)} {...props}>{children}</div>
);

const Mission = htmlMessage('i18n:footer:copyright:mission-text', MissionDiv);
const Copyrights = htmlMessage('i18n:footer:copyright:bottom-text', CopyrightsDiv);

const BareMessage: React.FunctionComponent<{ id: string }> = ({ id }) => (
  <FormattedMessage id={id}>{msg => msg}</FormattedMessage>
);

const ColumnHeadingMessage: React.FunctionComponent<{ id: string }> = ({
  id,
}) => (
  <h3 className="footer-column-heading">
    <BareMessage id={id} />
  </h3>
);

const FooterLinkMessage: React.FunctionComponent<{
  id: string;
  href: string;
  target?: string;
  rel?: string;
}> = ({ id, href, target, rel }) => {
  const safeRel = getSafeRelAttribute(target, rel);

  return (
    <a
      className="footer-link"
      href={href}
      target={target || '_self'}
      rel={safeRel}
    >
      <BareMessage id={id} />
    </a>
  );
};

function LinkList({ children }: React.PropsWithChildren<{}>) {
  return (
    <menu className="footer-link-list-wrapper">
      {React.Children.toArray(children).map((c, i) => <li key={i}>{c}</li>)}
    </menu>
  );
}

const OpenKeyboardShortcutsLink = () => {
  const dispatch = useDispatch();
  const trackOpenCloseKS = useAnalyticsEvent('openCloseKeyboardShortcuts');

  const openKeyboardShortcutsMenu = () => {
    captureOpeningElement('keyboardshortcuts');
    dispatch(openKeyboardShortcutsMenuAction());
    trackOpenCloseKS();
  };

  return (
    <FormattedMessage id='i18n:a11y:keyboard-shortcuts:heading'>
      {(txt) => (
        <button
          className="footer-button"
          type="button"
          onClick={openKeyboardShortcutsMenu}
          data-testid="shortcut-link"
        >
          {txt}
        </button>
      )}
    </FormattedMessage>
  );
};

const Column1 = () => (
  <div className="footer-column footer-column-1">
    <ColumnHeadingMessage id='i18n:footer:column1:help' />
    <LinkList>
      <FooterLinkMessage href='/contact' id='i18n:footer:column1:contact-us' />
      <FooterLinkMessage
        href={supportCenterLink}
        id='i18n:footer:column1:support-center'
        target='_blank'
        rel='noopener'
      />
      <FooterLinkMessage href='/faq' id='i18n:footer:column1:faqs' />
      <FooterLinkMessage
        href={systemStatusLink}
        id='i18n:footer:column1:system-status'
        target='_blank'
        rel='noopener'
      />
      <OpenKeyboardShortcutsLink />
    </LinkList>
  </div>
);

const Column2 = () => (
  <div className="footer-column footer-column-2">
    <ColumnHeadingMessage id='i18n:footer:column2:openstax' />
    <LinkList>
      <FooterLinkMessage href='/press' id='i18n:footer:column2:press' />
      <FooterLinkMessage
        href={newsletterLink}
        target='_blank'
        rel='noopener'
        id='i18n:footer:column2:newsletter'
      />
      <FooterLinkMessage href='/careers' id='i18n:footer:column2:careers' />
    </LinkList>
  </div>
);

const Column3 = () => (
  <div className="footer-column footer-column-3">
    <ColumnHeadingMessage id='i18n:footer:column3:policies' />
    <LinkList>
      <FooterLinkMessage
        href='/accessibility-statement'
        id='i18n:footer:column3:accessibility'
      />
      <FooterLinkMessage href='/tos' id='i18n:footer:column3:terms' />
      <FooterLinkMessage href='/license' id='i18n:footer:column3:license' />
      <FooterLinkMessage
        href='/privacy-policy'
        id='i18n:footer:column3:privacy-policy'
      />
      <RawCookiesLink className="footer-manage-cookies-link">
        <BareMessage id='i18n:footer:column3:manage-cookies' />
      </RawCookiesLink>
    </LinkList>
  </div>
);

function getValues() {
  return {
    copyrightLink,
    currentYear: new Date().getFullYear(),
  };
}

const NormalFooter = ({
  isVerticalNavOpen,
}: {
  isVerticalNavOpen: State['tocOpen'];
}) => (
  <footer
    className={classNames('footer-wrapper', {
      'footer-wrapper--vertical-nav-toolbar': isVerticalNavOpen === false,
    })}
    data-analytics-region='footer'
  >
    <div className="footer-inner">
      <div className="footer-top">
        <div className="footer-top-boxed">
          <h2 className="footer-heading">
            <BareMessage id='i18n:footer:heading' />
          </h2>
          <Mission />
          <Column1 />
          <Column2 />
          <Column3 />
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-boxed">
          <Copyrights values={getValues()} />
          <SocialDirectory />
        </div>
      </div>
    </div>
  </footer>
);

const PortalColumn1 = () => (
  <div className="footer-column footer-column-1">
    <Copyrights values={getValues()} />
  </div>
);

const PortalColumn2 = ({ portalName }: { portalName: string }) => {
  const { isOpen, open, close } = useContactDialog();
  const contactFormParams = [
    { key: 'source_url', value: assertWindow('Footer is browser-only').location.href },
  ].filter((p): p is { key: string; value: string } => !!p.value);

  return (
    <div className="footer-column footer-column-2">
      <LinkList>
        <button
          className="footer-button"
          data-testid="portal-footer-contact-button"
          onClick={() => {
            captureOpeningElement('contactdialog');
            open();
          }}
        >
          <BareMessage id='i18n:footer:column1:contact-us' />
        </button>
        <FooterLinkMessage href={`/${portalName}/tos`} id='i18n:footer:column3:terms' />
        <FooterLinkMessage href={`/${portalName}/privacy-policy`} id='i18n:footer:column3:privacy-policy' />
      </LinkList>
      <ContactDialog isOpen={isOpen} contactFormParams={contactFormParams} close={close} />
    </div>
  );
};

const PortalColumn3 = ({ portalName }: { portalName: string }) => (
  <div className="footer-column footer-column-3">
    <LinkList>
      <FooterLinkMessage
        href={`/${portalName}/accessibility-statement`}
        id='i18n:footer:column3:accessibility'
      />
      <FooterLinkMessage href={`/${portalName}/license`} id='i18n:footer:column3:license' />
      <RawCookiesLink className="footer-manage-cookies-flex-link">
        <BareMessage id='i18n:footer:column3:manage-cookies' />
      </RawCookiesLink>
    </LinkList>
  </div>
);

const PortalFooter = ({
  isVerticalNavOpen,
  portalName,
}: {
  isVerticalNavOpen: State['tocOpen'];
  portalName: string;
}) => {
  return (
    <footer
      className={classNames('footer-wrapper', {
        'footer-wrapper--vertical-nav-toolbar': isVerticalNavOpen === false,
      })}
      data-analytics-region='footer'
      data-testid='portal-footer'
    >
      <div className="footer-inner">
        <div className="footer-bottom">
          <div className="footer-portal-bottom-boxed">
            <PortalColumn1 />
            <PortalColumn2 portalName={portalName} />
            <PortalColumn3 portalName={portalName} />
          </div>
        </div>
      </div>
    </footer>
  );
};

const Footer = ({
  isVerticalNavOpen,
}: {
  isVerticalNavOpen: State['tocOpen'];
}) => {
  const params = useSelector(selectNavigation.params);
  return (
    !guards.isPortaled(params)
      ? <NormalFooter isVerticalNavOpen={isVerticalNavOpen} />
      : <PortalFooter portalName={params.portalName} isVerticalNavOpen={isVerticalNavOpen} />
  );
};

export default isVerticalNavOpenConnector(Footer);

// Re-export for backward compatibility with existing tests
export { ContactDialog, useContactDialog };
