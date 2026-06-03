import React from 'react';
import { KeyTermHit } from '../../types';
import './SearchResultsSidebar.css';

const RelatedKeyTermContent = ({ keyTermHit }: { keyTermHit: KeyTermHit }) => <div className="key-term-result">
  <span className="key-term">{keyTermHit.highlight.term}</span>
  <div dangerouslySetInnerHTML={{ __html: keyTermHit.highlight.visibleContent[0] }} />
</div>;

export default RelatedKeyTermContent;
