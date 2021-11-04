import React from 'react';
import { KeyTermHit } from '../../types';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const RelatedKeyTermContent = ({ keyTermHit }: { keyTermHit: KeyTermHit }) => <Styled.KeyTermResult>
  <Styled.KeyTerm>{keyTermHit.highlight.term}</Styled.KeyTerm>
  <div dangerouslySetInnerHTML={{ __html: keyTermHit.highlight.visibleContent[0] }} />
</Styled.KeyTermResult>;

export default RelatedKeyTermContent;
