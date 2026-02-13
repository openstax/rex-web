import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import KineticCTAMobile from '../../../assets/kinetic-cta-mobile.svg';
import KineticCTA from '../../../assets/kinetic-cta.svg';
import icon from '../../../assets/kinetic-logo.png';
import Button from '../../components/Button';
import { kineticBannerEnabled } from '../../featureFlags/selectors';
import theme from '../../theme';
import { disablePrint } from './utils/disablePrint';
import { isVerticalNavOpenConnector, styleWhenSidebarClosed } from './utils/sidebar';

const LabsLogo = styled.img`
  width: 10.7rem;
`;

const LabsCallWrapper = styled.div`
  width: 100%;
  max-width: 82.5rem;
  min-height: 12rem;
  margin: 0 auto 1.6rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  background-repeat: no-repeat;
  background-image: url(${KineticCTA});
  background-position: top right;
  background-size: cover;
  box-shadow: inset 0 0 0 1px #cacaca;
  ${theme.breakpoints.mobileMedium(css`
    background-position: center center;
    padding: 4.5rem 2.3rem 3.5rem;
    align-items: flex-start;
    flex-direction: column;
  `)}
  @media screen and (max-width: 35em) {
    background-image: url(${KineticCTAMobile});
    padding: 2rem 1.2rem 2.8rem;
  }

  ${disablePrint}
`;

/* stylelint-disable block-opening-brace-newline-after, block-closing-brace-newline-before */
/* stylelint-disable block-opening-brace-space-after, block-closing-brace-space-before */
const Column = styled.div`
  display: flex;
  flex-direction: column;
  color: ${theme.color.primary.gray.darker};
  overflow: hidden;
  ${(props) => props.maxWidth ? css`max-width: ${props.maxWidth}rem;` : null}
  ${(props) => props.noShrink ? css`flex-shrink: 0;` : null}
  ${(props) => !props.last ? css`
    margin-right: 2.5rem;

    ${theme.breakpoints.mobileMedium(css`
      margin-right: 0;
      margin-bottom: 2.4rem;
    `)}
    ${theme.breakpoints.mobile(css`
      margin-right: 0;
    `)}
  ` : null}

  ${theme.breakpoints.mobileMedium(css`
    margin-right: 0;
    max-width: unset;
  `)}
`;

const LabsCallHeader = isVerticalNavOpenConnector(styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;

  ${Column} {
    margin-right: 1.4rem;

    &:last-child {
      margin-right: 14rem;

      @media screen and (min-width: 77em) and (max-width: 79em) {
        margin-right: 15rem;
      }

      @media screen and (min-width: 79em) and (max-width: 85em) {
        margin-right: 20rem;
      }

      ${styleWhenSidebarClosed(css`
        margin-right: 16rem;

        @media screen and (min-width: 79em) and (max-width: 85em) {
          margin-right: 16rem;
        }

        @media screen and (min-width: 54em) and (max-width: 58em) {
          margin-right: 21rem;
        }

        @media screen and (min-width: 50em) and (max-width: 52em) {
          margin-right: 14rem;
        }
      `)}
    }
  }

  ${theme.breakpoints.mobileMedium(css`
    align-items: initial;
    flex-direction: column;

    ${LabsLogo} {
      margin-right: 2.5rem;
    }
    ${Column}:last-child {
      margin-right: 1.4rem;
    }
  `)}
`);

const LabsText = styled.div`
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 2.6rem;
  ${theme.breakpoints.mobileMedium(css`
    margin-right: 10rem;
    max-width: 31rem;
    margin-right: rem;
  `)}
  ${theme.breakpoints.mobileSmall(css`
    max-width: 20rem;
    font-size: 1.7rem;
    line-height: 2.2rem;
  `)}
`;

const LabsCallLink = styled(Button)`
  background-color: #6922ea;
  border-radius: 4px;
  height: 4rem;
`;

const LabsCTA = () => {
  const enabled = useSelector(kineticBannerEnabled);

  if (!enabled) {
    return null;
  }

  return (
    <LabsCallWrapper data-async-content>
      <LabsCallHeader>
        <Column noShrink>
          <LabsLogo src={icon} alt='' />
        </Column>
        <Column maxWidth={35.4}>
          <LabsText>
            Earn badges by participating in research and discover more insights about yourself!
          </LabsText>
        </Column>
      </LabsCallHeader>
      <Column last maxWidth={13.6}>
        <LabsCallLink
          component={<a href='/kinetic/'>
            <FormattedMessage id='i18n:toolbar:labs-cta:link'>
              {(msg: string) => msg}
            </FormattedMessage>
          </a>}
          data-analytics-label='kinetic-banner'
          variant='primary'
          size='large'
          target='_blank'
          rel='noopener'
        />
      </Column>
    </LabsCallWrapper>
  );
};

export default LabsCTA;
