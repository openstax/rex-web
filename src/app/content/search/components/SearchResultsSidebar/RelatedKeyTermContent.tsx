import React from 'react';
import { KeyTermHit } from '../../types';
import * as Styled from './styled';

// tslint:disable-next-line: variable-name
const RelatedKeyTermContent = ({ keyTermHit }: { keyTermHit: KeyTermHit }) => <Styled.KeyTermContainer tabIndex={-1}>
  <Styled.KeyTerm>{keyTermHit.highlight.term}</Styled.KeyTerm>
  <div>{keyTermHit.highlight.visibleContent[0]}</div>
</Styled.KeyTermContainer>;

export default RelatedKeyTermContent;
