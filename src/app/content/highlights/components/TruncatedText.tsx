import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { linkStyle } from '../../../components/Typography';
import { textStyle } from '../../../components/Typography/base';
import { cardPadding } from '../constants';

interface Props {
  text: string;
  isFocused: boolean;
  expanded: boolean;
  onExpand: boolean;
  className?: string;
}

// tslint:disable-next-line:variable-name
const Link = styled.button`
  ${textStyle}
  ${linkStyle}
  text-align: left;
  cursor: pointer;
  border: none;
  padding: 0;
  margin: ${cardPadding / 2}rem 0 0 0;
  background: none;
  font-size: 1.2rem;
  line-height: 1.6rem;
`;

// tslint:disable-next-line:variable-name
const Label = ({text, isFocused, onExpand, expanded, className}: Props) => {
  const labelRef = React.useRef<HTMLElement>(null);
  const [showLink, setShowLink] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (labelRef.current && labelRef.current.scrollHeight > labelRef.current.offsetHeight) {
      setShowLink(true);
    } else {
      setShowLink(false);
    }
  }, [expanded, isFocused]);

  return <React.Fragment>
    <label ref={labelRef} className={className}>{text}</label>
    {showLink && <FormattedMessage id='show more'>
      {(msg: Element | string) => <Link onClick={onExpand}>{msg}</Link>}
    </FormattedMessage>}
  </React.Fragment>;
};

const lineHeight = 1.8;
export default styled(Label)`
  ${textStyle}
  font-size: 1.4rem;
  line-height: ${lineHeight}rem;

  ${(props: Props) => !props.expanded && css`
    text-overflow: ellipsis;
    overflow: hidden;
    max-height: ${lineHeight * 3}rem;
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  `}
`;
