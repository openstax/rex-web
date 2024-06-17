import React from 'react';
import { Building as School } from 'styled-icons/boxicons-regular/Building';
import styled from 'styled-components/macro';
import { toolbarIconStyles } from './iconStyles';
import { toolbarDefaultButton, toolbarDefaultText } from './styled';
import { toolbarIconColor } from '../constants';
import * as selectContent from '../../selectors';
import { useSelector } from 'react-redux';


// tslint:disable-next-line:variable-name
const ButtonWrapper = styled.a`
  ${toolbarDefaultButton}
  color: ${toolbarIconColor.base};
  text-decoration: none;
  height: auto;
  padding: 0;

  > svg {
    ${toolbarIconStyles}
  }
`;

// tslint:disable-next-line:variable-name
const ButtonText = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

// tslint:disable-next-line:variable-name
export const MoreToolbarButtons = () => {
  const book = useSelector(selectContent.book);

  if (!book) return null;

  return <>
    <ButtonWrapper href={`https://localhost:3015?scope=${encodeURIComponent(`https://openstax.org/orn/book/${book.id}`)}`}>
      <School />
      <ButtonText>My Course</ButtonText>
    </ButtonWrapper>
  </>;
};
