import React from 'react';
import styled, { css } from 'styled-components/macro';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { cardWidth } from '../constants';

interface Props {
  note: string;
  isFocused: boolean;
  onEdit: () => void;
  onRemove: () => void;
  className: string;
}

// tslint:disable-next-line:variable-name
const DisplayNote = ({note, className}: Props) => {
  return <div className={className}>
    {note}
  </div>;
};

export default styled(DisplayNote)`
  width: ${cardWidth}rem;
  background: ${theme.color.neutral.formBackground};
  ${(props: Props) => props.isFocused && css`
    background: ${theme.color.white};
  `}
  ${textStyle}
  font-size: 1.4rem;
  line-height: 1.8rem;
`;
