import { ContentBottomConfig } from '../types'
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularSize, textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { myContentBottomPlacements } from '../selectors';
import { contentTextWidth } from '../../components/constants';

// tslint:disable-next-line:variable-name
const Alignment = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: ${contentTextWidth}rem;
  overflow: visible;
  background-color: blue
`;

const Title = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: white;
`;

const Blurb = styled.div`
  font-size: 1.5rem;
  color: white;
  ${textRegularStyle}
  line-height: 1.7rem;
  flex: 1;
  align-self: stretch;
`;

// tslint:disable-next-line:variable-name
const ButtonLink = styled.a`
  ${textRegularSize};
  float: right;
  font-size: 1.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  height: 5rem;
  width: 19rem;
  color: ${theme.color.primary.orange.base};
  border: solid 0.1rem;
  font-weight: 700;
`;

// tslint:disable-next-line: variable-name
const ContentBottomPlacement = () => {
  const placements = useSelector(myContentBottomPlacements);
  const placement = placements[Math.floor(Math.random()*placements.length)];

  if (!placement) { return null; }

  const config = placement.config as ContentBottomConfig;

  // hide if no placement config

  return <Alignment>
    <Title>
      {config.title}
    </Title>
    <Blurb>
      {config.blurb}
    </Blurb>
    <ButtonLink
      // aria-label={formatMessage({id: 'i18n:toolbar:buy-book:aria-label:text'})} // TODO: what to do here?
      target='_blank'
      rel='noopener'
      href={config.url}
      data-analytics-label='content-bottom-placement'
    >
    </ButtonLink>
  </Alignment>;
};

export default ContentBottomPlacement;
