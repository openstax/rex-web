import { Element } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { typesetMath } from '../../../helpers/mathjax';
import BookStyles from './BookStyles';

interface PropTypes {
  content: string;
}

export default class PageContent extends Component<PropTypes> {
  public container: Element | undefined | null;

  public getCleanContent = () => {
    const {content} = this.props;
    return content
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      .replace(/<div data-type="document-title">[\s\S]*?<\/div>/g, '')
      .replace(/<cnx-pi.*>[\s\S]*<\/cnx-pi>/g, '');
  }

  public componentDidMount() {
    this.postProcess();
  }

  public componentDidUpdate() {
    this.postProcess();
  }

  public render() {
    return <BookStyles>
      {(className) => <div className={className}>
        <div data-type='chapter'>
          <div
            data-type='page'
            ref={(ref: any) => this.container = ref}
            dangerouslySetInnerHTML={{ __html: this.getCleanContent()}}
          />
        </div>
      </div>}
    </BookStyles>;
  }

  private postProcess() {
    if (this.container && typeof(window) !== 'undefined') {
      typesetMath(this.container, window);
    }
  }
}
