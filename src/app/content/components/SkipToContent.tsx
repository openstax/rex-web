import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { AppState } from '../../types';
import * as select from '../selectors';

const HiddenLink = styled.a`
    /* Hide the link when it is not focused */
    clip: rect(1px,1px,1px,1px);
    margin: 0;
    position: absolute;
    left: 0;
    top: 0;
    height: 1px;
    width: 1px;
    overflow: hidden;

    text-decoration: none;

    /* Show the link when it is focused */
    :focus {
        clip: auto;
        height: auto;
        width: auto;
        z-index: 20;
    }
`;

interface PropTypes {
  targetId: string;
  loading: boolean;
}

class SkipToContent extends Component<PropTypes, never> {

  public render() {
    const { targetId } = this.props;
    return !this.isLoading() && <HiddenLink href={`#${targetId}`} tabIndex={1}>Skip to Content</HiddenLink>;
  }

  private isLoading() {
    return this.props.loading;
  }
}

export default connect(
  (state: AppState) => ({
    loading: !!select.loadingBook(state) || !!select.loadingPage(state),
  })
)(SkipToContent);
