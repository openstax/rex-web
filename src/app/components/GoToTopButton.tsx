import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import { AngleUp } from 'styled-icons/fa-solid/AngleUp';
import { disablePrint } from '../content/components/utils/disablePrint';
import { PlainButton } from './Button';

export const GoToTopWrapper = styled(PlainButton)`
  width: 4.8rem;
  height: 4.8rem;
  position: absolute;
  z-index: 2;
  bottom: 4.8rem;
  right: 4.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  ${disablePrint}
`;

export const GoToTop = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  background: #959595;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

export const GoToTopIcon = styled(AngleUp)`
  width: 1.6rem;
  height: 1.6rem;
`;

interface GoToTopButtonProps {
  i18nAriaLabel: string;
  onClick: () => void;
  [key: string]: unknown;
}

const GoToTopButton = ({ i18nAriaLabel, onClick, ...rest }: GoToTopButtonProps) => <GoToTopWrapper
  onClick={onClick}
  aria-label={useIntl().formatMessage({id: i18nAriaLabel})}
  type='button'
  {...rest}
>
  <GoToTop>
    <GoToTopIcon />
  </GoToTop>
</GoToTopWrapper>;

export default GoToTopButton;
