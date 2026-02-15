import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { AnyStyledComponent,  css } from 'styled-components/macro';
import { linkStyle } from '../../../components/Typography';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { cardPadding } from '../constants';

interface Props {
  id: string;
  text: string;
  isActive: boolean;
  className?: string;
  onChange: () => void;
}

const Link = styled.span`
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

const NoteText = ({id, text, isActive, className, onChange }: Props) => {
  const noteTextRef = React.useRef<HTMLElement>(null);
  const [showLink, setShowLink] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (noteTextRef.current && noteTextRef.current.scrollHeight > noteTextRef.current.offsetHeight) {
      setShowLink(true);
    } else {
      setShowLink(false);
    }
    onChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return <React.Fragment>
    <p id={id} ref={noteTextRef} className={className}>{text}</p>
    {showLink && <FormattedMessage id='i18n:highlighting:card:show-more'>
      {(msg: string) => <Link>{msg}</Link>}
    </FormattedMessage>}
  </React.Fragment>;
};

const lineHeight = 1.8;
export default styled(NoteText as AnyStyledComponent)`
  ${textStyle}
  overflow: hidden;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  font-size: 1.4rem;
  line-height: ${lineHeight}rem;
  margin: 0 ${cardPadding / 2}rem 0 0;
  padding: 0;
  ${(props: Props) => props.isActive && css`
    + ${Link} {
      display: none;
    }
  `}
  ${(props: Props) => !props.isActive && css`
    text-overflow: ellipsis;
    overflow: hidden;
    max-height: ${lineHeight * 3}rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  `}

  ${theme.breakpoints.touchDeviceQuery(css`
    padding: ${cardPadding}rem ${cardPadding * 2}rem;
    height: 15.2rem;
    overflow: auto;
  `)}
`;
