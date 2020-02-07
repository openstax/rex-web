import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css, keyframes } from 'styled-components/macro';
import { ActionType } from 'typesafe-actions';
import Times from '../../components/Times';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight,
  toolbarMobileSearchWrapperHeight
} from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { assertWindow } from '../../utils';
import { dismissNotification, searchFailure,  } from '../actions';
import { inlineDisplayBreak } from '../theme';
import { Header } from './Card';

export const clearErrorAfter = 3200;
const fadeOutDuration = 1000;

const bannerBackground = '#F8E8EB';
const errorBorderColor = '#E297A0';
const closeIconClor = '#EDBFC5';
const hoveredCloseIconColor = errorBorderColor;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// tslint:disable-next-line:variable-name
const BannerBodyWrapper = styled.div<{shouldFadeOut: boolean}>`
  width: 100%;
  margin: 0;
  height: 0;
  z-index: ${theme.zIndex.contentNotifications};
  overflow: visible;
  position: sticky;
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;

  @media (max-width: ${inlineDisplayBreak}) {
    top: ${bookBannerMobileMiniHeight + toolbarMobileHeight + toolbarMobileSearchWrapperHeight}rem;
    z-index: calc(${theme.zIndex.searchSidebar} + 1);
  }

  ${(props) => props.shouldFadeOut && css`
    animation: ${fadeOut} ${fadeOutDuration / 1000}s forwards;
  `}

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
const BannerBody = styled.div`
  width: 100%;
  position: absolute;
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  background: ${bannerBackground};
  justify-content: space-between;
  border: 1px solid ${errorBorderColor};

  ${Header} {
    width: 90%;
    background: inherit;
    color: ${theme.color.text.red};
    font-weight: normal;
    line-height: 2.6rem;
  }

  @media (max-width: ${inlineDisplayBreak}) {
    align-items: flex-start;
    padding: 1.6rem ${theme.padding.page.mobile}rem;
  }
`;

// tslint:disable-next-line:variable-name
const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  width: 1.8rem;
  height: 1.8rem;
  cursor: pointer;
`;

// tslint:disable-next-line:variable-name
const CloseButton = styled.button`
  background: transparent;
  border: 0;
  padding: 0;
  color: ${closeIconClor};

  &:hover {
    color: ${hoveredCloseIconColor};
  }
`;

interface Props {
  dismiss: () => void;
}

// tslint:disable-next-line:variable-name
class SearchFailure extends React.Component<Props, {shouldFadeOut: boolean}> {
  public state = { shouldFadeOut: false };
  public autoClose: number;

  constructor(props: Props) {
    super(props);
    this.autoClose = setTimeout(this.startFadeOut, clearErrorAfter);
  }

  public componentDidMount() {
    const window = assertWindow();

    window.addEventListener('click', this.startFadeOut);
    window.addEventListener('scroll', this.startFadeOut);
  }

  public componentWillUnmount() {
    this.cleanup();
  }

  public cleanup() {
    const window = assertWindow();

    window.removeEventListener('click', this.startFadeOut);
    window.removeEventListener('scroll', this.startFadeOut);
    clearTimeout(this.autoClose);
  }

  public startFadeOut = () => {
    this.cleanup();
    this.setState({
      shouldFadeOut: true,
    });
  };

  public render() {
    return (
      <BannerBodyWrapper
        data-testid='banner-body'
        onAnimationEnd={this.props.dismiss}
        shouldFadeOut={this.state.shouldFadeOut}
      >
        <BannerBody>
          <FormattedMessage id='i18n:notification:search-failure'>
            {(txt) =>  <Header>{txt}</Header>}
          </FormattedMessage>
          <CloseButton onClick={this.props.dismiss}>
            <CloseIcon />
          </CloseButton>
        </BannerBody>
      </BannerBodyWrapper>
    );
  }
}

export default connect(
  () => ({
  }),
  (dispatch: Dispatch, ownProps: {notification: ActionType<typeof searchFailure>}) => ({
    dismiss: () => {
      dispatch(dismissNotification(ownProps.notification));
    },
  })
)(SearchFailure);
