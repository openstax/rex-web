import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import KineticCTAMobile from '../../../assets/kinetic-cta-mobile.svg';
import KineticCTA from '../../../assets/kinetic-cta.svg';
import icon from '../../../assets/kinetic-logo.png';
import Button from '../../components/Button';
import { kineticBannerEnabled } from '../../featureFlags/selectors';
import theme from '../../theme';
import { isVerticalNavOpenConnector } from './utils/sidebar';
import './LabsCall.css';

interface LabsCallHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  isDesktopSearchOpen: boolean;
  isTocOpen: boolean | null;
  isVerticalNavOpen: boolean | null;
  dispatch?: unknown; // Injected by Redux connector, should not be passed to DOM
}

/**
 * LabsCallHeader component - Header section for Kinetic banner
 * Connected to Redux via isVerticalNavOpenConnector for sidebar state.
 */
const LabsCallHeaderComponent = React.forwardRef<HTMLDivElement, LabsCallHeaderProps>(
  function LabsCallHeader(
    {
      isDesktopSearchOpen,
      isTocOpen: _isTocOpen,
      isVerticalNavOpen,
      dispatch: _dispatch,
      className,
      children,
      ...props
    },
    ref
  ) {
    // Determine sidebar closed state (matching styleWhenSidebarClosed logic)
    // - If isVerticalNavOpen is null, sidebar is closed on mobile only
    // - If both isDesktopSearchOpen and isVerticalNavOpen are false, sidebar is closed
    const isSidebarClosed = isDesktopSearchOpen === false && isVerticalNavOpen === false;
    const isSidebarClosedMobile = isVerticalNavOpen === null;

    return (
      <div
        {...props}
        ref={ref}
        className={classNames('labs-call-header', className)}
        data-sidebar-closed={isSidebarClosed}
        data-sidebar-closed-mobile={isSidebarClosedMobile}
      >
        {children}
      </div>
    );
  }
);

const LabsCallHeader = isVerticalNavOpenConnector(LabsCallHeaderComponent);

/**
 * LabsCTA component - Kinetic banner call-to-action
 * Displays a promotional banner for the Kinetic research program.
 */
function LabsCTA() {
  const enabled = useSelector(kineticBannerEnabled);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className={classNames('labs-call-wrapper')}
      data-async-content
      style={{
        '--kinetic-cta-bg': `url(${KineticCTA})`,
        '--kinetic-cta-mobile-bg': `url(${KineticCTAMobile})`,
        '--primary-gray-darker': theme.color.primary.gray.darker,
      } as React.CSSProperties}
    >
      <LabsCallHeader>
        <div className={classNames('labs-call-column')} data-no-shrink="true">
          <img src={icon} alt='' className={classNames('labs-logo')} />
        </div>
        <div
          className={classNames('labs-call-column')}
          data-max-width="true"
          style={{ '--column-max-width': '35.4rem' } as React.CSSProperties}
        >
          <div className={classNames('labs-text')}>
            Earn badges by participating in research and discover more insights about yourself!
          </div>
        </div>
      </LabsCallHeader>
      <div
        className={classNames('labs-call-column')}
        data-last="true"
        data-max-width="true"
        style={{ '--column-max-width': '13.6rem' } as React.CSSProperties}
      >
        <Button
          component={<a href='/kinetic/'>
            <FormattedMessage id='i18n:toolbar:labs-cta:link'>
              {(msg) => msg}
            </FormattedMessage>
          </a>}
          className={classNames('labs-call-link')}
          data-analytics-label='kinetic-banner'
          variant='primary'
          size='large'
          target='_blank'
          rel='noopener'
        />
      </div>
    </div>
  );
}

export default LabsCTA;
