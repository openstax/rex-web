import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../types';
import * as select from '../selectors';
import HiddenLink from './HiddenLink';

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
