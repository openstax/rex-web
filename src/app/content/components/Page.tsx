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
      // remove body and surrounding content
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      // fix assorted self closing tags
      .replace(/<(em|h3|iframe|span|strong|sub|sup|u)([^>]*?)\/>/g, '<$1$2></$1>')
    ;
  }

  public componentDidUpdate(prevProps: PropTypes) {
    if (window && prevProps.content !== this.props.content) {
      window.scrollTo(0, 0);
    }
    this.postProcess();
  }

  public componentDidMount() {
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
