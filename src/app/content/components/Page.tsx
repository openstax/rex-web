import css from 'cnx-recipes/styles/output/intro-business.json';
import React, { Component } from 'react';
import styled from 'styled-components';

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
      .replace(/<cnx-pi.*>[\s\S]*<\/cnx-pi>/g, '');
  }

  public render() {
    const {className} = this.props as PropTypes & StyledProps;
    return <div className={className}>
      <div data-type='chapter'>
        <div data-type='page' dangerouslySetInnerHTML={{ __html: this.getCleanContent()}} />
      </div>
    </div>;
  }
}

export default styled(PageContent)`
  ${css}
`;
