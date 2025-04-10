import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
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
import { contentWrapperAndNavWidthBreakpoint, contentWrapperWidthBreakpoint } from '../ContentPane';
import { ToastProps } from '../../../notifications/components/ToastNotifications/Toast';

export const desktopSearchFailureTop = bookBannerDesktopMiniHeight + topbarDesktopHeight;
export const getMobileSearchFailureTop = ({mobileToolbarOpen}: {mobileToolbarOpen: boolean}) => mobileToolbarOpen
  ? bookBannerMobileMiniHeight + topbarMobileHeight + toolbarMobileSearchWrapperHeight
  : bookBannerMobileMiniHeight + topbarMobileHeight;

// tslint:disable-next-line:variable-name
export const ToastContainerWrapper = styled.div`
  position: sticky;
  overflow: visible;
  z-index: ${theme.zIndex.contentNotifications - 1};
  top: ${desktopSearchFailureTop}rem;

  @media screen and ${contentWrapperAndNavWidthBreakpoint} {
    max-width: calc(100vw - ((100vw - ${contentWrapperMaxWidth}rem) / 2) - ${verticalNavbarMaxWidth}rem);
    left: calc(100vw - (100vw - ((100vw - ${contentWrapperMaxWidth}rem) / 2) - ${verticalNavbarMaxWidth}rem));
  }

  @media screen and ${contentWrapperWidthBreakpoint} {
    max-width: calc(100vw - ${verticalNavbarMaxWidth}rem);
    left: ${verticalNavbarMaxWidth}rem;
  }

  ${theme.breakpoints.mobile(css`
    max-width: 100%;
    left: 0;
    z-index: ${theme.zIndex.contentNotifications + 1};
    top: ${getMobileSearchFailureTop}rem;
  `)}
`;

/*
 *  positioning the toast is complicated because the toast is sticky and there is no container
 *  that perfectly spans the distance between the nav bar and the end of the content wrapper
 *  (white bg) between certain viewports (1200px and 1440px) when the nav is closed.
 *
 *  ideally this issue would be solved by adjusting the max-width of CenteredContentRow and
 *  adjusting the padding on ContentPane accordingly but this introduces conflicts with the
 *  grid layout.
 */

// tslint:disable-next-line:variable-name
const PageToasts = (props: ToastProps | {}) => {
  const toasts = useSelector(groupedToastNotifications).page;
  const mobileToolbarOpen = useSelector(mobileToolbarOpenSelector);
  const [toastsHidden, setToastsHidden] = React.useState(true);

  // timeout so that screenreaders will pick up the toasts populating the live region
  // https://tetralogical.com/blog/2024/05/01/why-are-my-live-regions-not-working/
  React.useEffect(() => {
    setTimeout(() => setToastsHidden(false), 1000);
  }, [setToastsHidden]);

  return (
    <ToastContainerWrapper aria-live='polite' role='alertdialog' {...props} mobileToolbarOpen={mobileToolbarOpen}>
      {toasts && !toastsHidden ? <ToastNotifications toasts={toasts} /> : null}
    </ToastContainerWrapper>
  );
};

export default PageToasts;
