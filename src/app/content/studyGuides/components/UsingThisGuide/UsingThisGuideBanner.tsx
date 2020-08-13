import React from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../../../../theme';
import desktopBanner from './assets/banner.png';
import mobileBanner from './assets/banner_mobile.png';
import { filters } from '../../../styles/PopupConstants';
import { FormattedMessage } from 'react-intl';
import { H2, h4MobileStyle } from '../../../../components/Typography/headings';
import { Times } from 'styled-icons/fa-solid/Times';

const bannerStyles = css`
  width: 100%;
`;

// tslint:disable-next-line: variable-name
const BannerWrapper = styled.div`
  background: ${theme.color.black};
  margin-bottom: 1rem;
  width: 100%;
  padding: ${filters.dropdownToggle.topBottom.desktop}rem ${filters.dropdownToggle.sides.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: ${filters.dropdownToggle.topBottom.mobile}rem ${filters.dropdownToggle.sides.mobile}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const DesktopBanner = styled.img`
  ${bannerStyles}
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
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

interface Props {
  onClick: () => void;
}

// tslint:disable-next-line:variable-name
const UsingThisGuideBanner = (props: Props) => {
  return <BannerWrapper>
    <HeaderWrapper>
      <FormattedMessage id='i18n:studyguides:popup:using-this-guide'>
        {(msg: Element | string) => <UsingThisGuideTitle>{msg}</UsingThisGuideTitle>}
      </FormattedMessage>
      <CloseIcon onClick={props.onClick} />
    </HeaderWrapper>
    <FormattedMessage id='i18n:studyguides:popup:using-this-guide:alt'>
      {(msg: Element | string) => <React.Fragment>
        <DesktopBanner src={desktopBanner} alt={msg}/>
        <MobileBanner src={mobileBanner} alt={msg}/>
      </React.Fragment>}
    </FormattedMessage>
  </BannerWrapper>;
};

export default UsingThisGuideBanner;
