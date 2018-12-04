import React, { Component } from 'react';
import BookStyles from './BookStyles';

interface PropTypes {
  content: string;
}

export default class PageContent extends Component<PropTypes> {

  public getCleanContent = () => {
    const {content} = this.props;
    return content
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      .replace(/<div data-type="document-title">[\s\S]*?<\/div>/g, '')
      .replace(/<cnx-pi.*>[\s\S]*<\/cnx-pi>/g, '');
  }

  public render() {
    return <BookStyles>
      {(className) => <div className={className}>
        <div data-type='chapter'>
          <div data-type='page' dangerouslySetInnerHTML={{ __html: this.getCleanContent()}} />
        </div>
      </div>}
    </BookStyles>;
  }
}
