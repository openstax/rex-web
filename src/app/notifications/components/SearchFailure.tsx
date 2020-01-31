import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import { ActionType } from 'typesafe-actions';
import Times from '../../components/Times';
import {
  bookBannerDesktopMiniHeight,
  bookBannerMobileMiniHeight,
  toolbarDesktopHeight,
  toolbarMobileHeight,
} from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { assertWindow } from '../../utils';
import { dismissNotification, searchFailure,  } from '../actions';
import { inlineDisplayBreak } from '../theme';
import { Header } from './Card';

export const clearErrorAfter = 3200;

const bannerBackground = '#F8E8EB';
const errorBorderColor = '#E297A0';
const closeIconClor = '#EDBFC5';
const hoveredCloseIconColor = errorBorderColor;

// tslint:disable-next-line:variable-name
const BannerBodyWrapper = styled.div`
  width: 100%;
  margin: 0;
  height: 0;
  z-index: ${theme.zIndex.contentNotifications};
  overflow: visible;
  position: sticky;
  top: ${bookBannerDesktopMiniHeight + toolbarDesktopHeight}rem;

  @media (max-width: ${inlineDisplayBreak}) {
    top: ${bookBannerMobileMiniHeight + toolbarMobileHeight}rem;
    z-index: calc(${theme.zIndex.searchSidebar} + 1);
  }

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
class SearchFailure extends React.Component<Props> {
  public autoClose: number;

  constructor(props: Props) {
    super(props);
    this.autoClose = setTimeout(this.dismissAndClearEvents, clearErrorAfter);
  }

  public componentDidMount() {
    const window = assertWindow();

    window.addEventListener('click', this.dismissAndClearEvents);
    window.addEventListener('scroll', this.dismissAndClearEvents);
  }

  public dismissAndClearEvents = () => {
    clearTimeout(this.autoClose);

    this.props.dismiss();
    this.clearWindowEvents();
  };

  public clearWindowEvents = () => {
    const window = assertWindow();
    window.removeEventListener('click', this.dismissAndClearEvents);
    window.removeEventListener('scroll', this.dismissAndClearEvents);
  };

  public render() {
    return (
      <BannerBodyWrapper>
        <BannerBody>
          <FormattedMessage id='i18n:notification:search-failure'>
            {(txt) =>  <Header>{txt}</Header>}
          </FormattedMessage>
          <CloseButton onClick={this.dismissAndClearEvents}>
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
