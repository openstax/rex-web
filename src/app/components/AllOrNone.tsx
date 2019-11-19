import React from 'react';
import styled from 'styled-components/macro';
import { ButtonLink } from './Button';

interface Props {
  className?: string;
  onAll: () => void;
  onNone: () => void;
}

// tslint:disable-next-line:variable-name
const AllOrNone = ({className, onAll, onNone}: Props) => <div className={className}>
  <ButtonLink decorated onClick={onAll}>All</ButtonLink>
  <span>|</span>
  <ButtonLink decorated onClick={onNone}>None</ButtonLink>
</div>;

export default styled(AllOrNone)`
  &, ${ButtonLink} {
    font-size: 1.4rem;
  }
  height: 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    padding: 0 1rem;
  }
`;
