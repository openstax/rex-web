import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  contentWrapperMaxWidth,
  toolbarMobileSearchWrapperHeight,
  topbarDesktopHeight,
  topbarMobileHeight,
  verticalNavbarMaxWidth,
} from '../../../content/components/constants';
import ToastNotifications from '../../../notifications/components/ToastNotifications';
import { groupedToastNotifications } from '../../../notifications/selectors';
import theme from '../../../theme';
import { mobileToolbarOpen as mobileToolbarOpenSelector } from '../../search/selectors';
import './PageToasts.css';

export const desktopSearchFailureTop = bookBannerDesktopMiniHeight + topbarDesktopHeight;
export const getMobileSearchFailureTop = ({mobileToolbarOpen}: {mobileToolbarOpen: boolean}) => mobileToolbarOpen
  ? bookBannerMobileMiniHeight + topbarMobileHeight + toolbarMobileSearchWrapperHeight
  : bookBannerMobileMiniHeight + topbarMobileHeight;

/**
 * PageToasts component - Container for page-level toast notifications
 *
 * Migrated from styled-components to plain CSS.
 * Theme-stripping because Assigned.tsx still calls styled(PageToasts)
 */
function PageToasts({style, theme: _theme, ...props}: React.HTMLAttributes<HTMLDivElement> & {theme?: unknown}) {
  const toasts = useSelector(groupedToastNotifications).page;
  const mobileToolbarOpen = useSelector(mobileToolbarOpenSelector);
  const [toastsHidden, setToastsHidden] = React.useState(true);

  // timeout so that screenreaders will pick up the toasts populating the live region
  // https://tetralogical.com/blog/2024/05/01/why-are-my-live-regions-not-working/
  React.useEffect(() => {
    setTimeout(() => setToastsHidden(false), 1000);
  }, [setToastsHidden, toastsHidden]);

  const mobileSearchFailureTop = getMobileSearchFailureTop({ mobileToolbarOpen });

  return (
    <div
      {...props}
      aria-live='polite'
      className={classNames('page-toast-container', props.className)}
      style={{
        '--toast-z-index-desktop': theme.zIndex.contentNotifications - 1,
        '--toast-z-index-mobile': theme.zIndex.contentNotifications + 1,
        '--desktop-search-failure-top': `${desktopSearchFailureTop}rem`,
        '--mobile-search-failure-top': `${mobileSearchFailureTop}rem`,
        '--content-wrapper-max-width': `${contentWrapperMaxWidth}rem`,
        '--vertical-navbar-max-width': `${verticalNavbarMaxWidth}rem`,
        ...style,
      } as React.CSSProperties}
    >
      {toasts && !toastsHidden ? <ToastNotifications toasts={toasts} /> : null}
    </div>
  );
}

export default PageToasts;
