import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import { AngleUp } from 'styled-icons/fa-solid/AngleUp';
import { disablePrint } from '../content/components/utils/disablePrint';

// tslint:disable-next-line:variable-name
export const GoToTopWrapper = styled.div`
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
export const GoToTopIcon = styled(AngleUp)`
  width: 1.6rem;
  height: 1.6rem;
`;

interface GoToTopButtonProps {
  i18nAriaLabel: string;
  onClick: () => void;
  [key: string]: any;
}

// tslint:disable-next-line: variable-name
const GoToTopButton = ({ i18nAriaLabel, onClick, ...rest }: GoToTopButtonProps) => <GoToTopWrapper
  onClick={onClick}
  aria-label={useIntl().formatMessage({id: i18nAriaLabel})}
  {...rest}
>
  <GoToTop>
    <GoToTopIcon />
  </GoToTop>
</GoToTopWrapper>;

export default GoToTopButton;
