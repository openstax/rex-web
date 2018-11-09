// @ts-ignore
import css from '!!raw-loader!cnx-recipes/styles/output/intro-business.css';
import React, { Component } from 'react';
import styled from 'styled-components';

const ARCHIVE_URL = process.env.REACT_APP_ARCHIVE_URL;

interface PropTypes {
  content: string;
}
interface StyledProps {
  className: string;
}

class PageContent extends Component<PropTypes> {

  public getCleanContent = () => {
    const {content} = this.props;
    return content
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      .replace(/<div data-type="document-title">[\s\S]*?<\/div>/g, '')
      .replace(/<cnx-pi.*>[\s\S]*<\/cnx-pi>/g, '')
      .replace(/"\/resources/g, `"${ARCHIVE_URL}/resources`);
  }

  public render() {
    const {className} = this.props as PropTypes & StyledProps;
    return <div className={className} dangerouslySetInnerHTML={{ __html: this.getCleanContent()}} />;
  }
}

export default styled(PageContent)`
  margin: 0 auto;
  display: block;
  padding: 4rem 6rem 0 6rem;
  min-height: 6rem;
  outline: none;

  ${css}
`;
