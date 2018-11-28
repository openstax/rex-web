import React, { Component } from 'react';
import HiddenLink from './HiddenLink';

interface PropTypes {
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  targetId: string;
}

export default class SkipToContent extends Component<PropTypes, never> {

  public render() {
    const { targetId, onClick } = this.props;
    return <HiddenLink onClick={onClick} href={`#${targetId}`} tabIndex={1}>Skip to Content</HiddenLink>;
  }
}
