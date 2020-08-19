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
  margin: auto;
`;

// tslint:disable-next-line: variable-name
const BannerWrapper = styled.div`
  background: ${theme.color.black};
  margin-bottom: 1rem;
  width: 100%;
  padding: ${filters.dropdownToggle.topBottom.desktop}rem ${filters.dropdownToggle.sides.desktop}rem;
  ${theme.breakpoints.mobileSmall(css`
    padding: ${filters.dropdownToggle.topBottom.mobile}rem ${filters.dropdownToggle.sides.mobile}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const DesktopBanner = styled.img`
  ${bannerStyles}
  padding: 0 4.2rem;
  ${theme.breakpoints.mobileMedium(css`
    max-width: 30rem;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
const UsingThisGuideTitle = styled(H2)`
  text-align: center;
  width: 100%;
  color: ${theme.color.white};
  ${theme.breakpoints.mobile(css`
    ${h4MobileStyle}
    color: ${theme.color.white};
  `)}
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled(Times)`
  position: absolute;
  right: 0;
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
  position: relative;
`;

// tslint:disable-next-line: variable-name
const BodyWrapper = styled.div`
  display: flex;
  justify-content: center;
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
    <BodyWrapper>
      <FormattedMessage id='i18n:studyguides:popup:using-this-guide:alt'>
        {(msg: Element | string) => <picture>
          <source media={theme.breakpoints.mobileMediumQuery} srcSet={mobileBanner} />
          <DesktopBanner src={desktopBanner} alt={msg}/> 
        </picture>}
      </FormattedMessage>
    </BodyWrapper>
  </BannerWrapper>;
};

export default UsingThisGuideBanner;
