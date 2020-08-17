import { HTMLImageElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { PlainButton } from '../../../../components/Button';
import theme from '../../../../theme';
import { disablePrint } from '../../../components/utils/disablePrint';
import desktopBanner from './assets/banner.png';
import mobileBanner from './assets/banner_mobile.png';
import { filters } from '../../../styles/PopupConstants';
import { FormattedMessage } from 'react-intl';
import { H2, h4MobileStyle } from '../../../../components/Typography/headings';
import { Times } from 'styled-icons/fa-solid/Times';
import { cookieUTG } from './constants';

const bannerStyles = css`
  width: 100%;
`;

// tslint:disable-next-line: variable-name
const BannerWrapper = styled.div`
  position: relative;
  background: ${theme.color.black};
  margin-bottom: 1rem;
  width: 100%;
  padding: ${filters.dropdownToggle.topBottom.desktop}rem ${filters.dropdownToggle.sides.desktop}rem;
  ${PlainButton} {
    position: absolute;
    top: 4.6rem;
    right: 3.2rem;
  }
  ${theme.breakpoints.mobile(css`
    padding: ${filters.dropdownToggle.topBottom.mobile}rem ${filters.dropdownToggle.sides.mobile}rem;
    ${PlainButton} {
      top: 1.5rem;
      right: 1.6rem;
    }
  `)}

  ${disablePrint}
`;

// tslint:disable-next-line: variable-name
const DesktopBanner = styled.img`
  ${bannerStyles}
  padding: 0 4.2rem 4.9rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
const MobileBanner = styled.img`
  ${bannerStyles}
  display: none;
  ${theme.breakpoints.mobile(css`
    display: block;
    padding: 0 5.6rem 0.2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const UsingThisGuideTitle = styled(H2)`
  text-align: center;
  width: 100%;
  color: ${theme.color.white};
  ${theme.breakpoints.mobile(h4MobileStyle)}
  ${theme.breakpoints.mobile(css`
    color: ${theme.color.white};
  `)}
`;

// tslint:disable-next-line:variable-name
const CloseIcon = styled(Times)`
  background: ${theme.color.white};
  color: ${theme.color.black};
  height: 2.8rem;
  width: 2.8rem;
  border-radius: 50%;
  padding: 0.4rem;
  cursor: pointer;
  ${theme.breakpoints.mobile(css`
    height: 1.6rem;
    width: 1.6rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const HeaderWrapper = styled.div`
  text-align: center;
`;

interface Props {
  onClick: () => void;
  show: boolean;
  isOpenedForTheFirstTime: boolean;
}

// tslint:disable-next-line:variable-name
const UsingThisGuideBanner = (props: Props) => {
  const desktopBannerRef = React.useRef<HTMLImageElement>(null);
  const mobileBannerRef = React.useRef<HTMLImageElement>(null);
  const toggleCounter = React.useRef(0);
  const trackOpenUTG = useAnalyticsEvent('openUTG');

  React.useEffect(() => {
    if (props.show) {
      toggleCounter.current += 1;
      Cookies.set(cookieUTG, 'true');
    }
    // Send GA event when banner is open, except when it is opened initially.
    if (props.show && (!props.isOpenedForTheFirstTime || toggleCounter.current > 1)) {
      trackOpenUTG();
    }
  }, [props.show]);

  React.useEffect(() => {
    // Do not focus image if banner was opened initially
    if (props.isOpenedForTheFirstTime && toggleCounter.current <= 1) { return; }
    if (desktopBannerRef.current && desktopBannerRef.current.style.display !== 'none') {
      desktopBannerRef.current.focus();
    } else if (mobileBannerRef.current && mobileBannerRef.current.style.display !== 'none') {
      mobileBannerRef.current.focus();
    }
  }, [props.isOpenedForTheFirstTime, props.show]);

  if (!props.show) { return null; }

  return <BannerWrapper>
    <HeaderWrapper>
      <FormattedMessage id='i18n:studyguides:popup:using-this-guide'>
        {(msg: Element | string) => <UsingThisGuideTitle>{msg}</UsingThisGuideTitle>}
      </FormattedMessage>
    </HeaderWrapper>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide:alt'>
      {(msg: Element | string) => <React.Fragment>
        <DesktopBanner src={desktopBanner} alt={msg} ref={desktopBannerRef} tabIndex={0} />
        <MobileBanner src={mobileBanner} alt={msg} ref={mobileBannerRef} tabIndex={0} />
      </React.Fragment>}
    </FormattedMessage>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide:close:aria-label'>
      {(msg: string) => <PlainButton onClick={props.onClick} aria-label={msg}>
        <CloseIcon />
      </PlainButton>}
    </FormattedMessage>
  </BannerWrapper>;
};

export default UsingThisGuideBanner;
