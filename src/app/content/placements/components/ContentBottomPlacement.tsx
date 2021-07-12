import { ContentBottomConfig } from '../types'
import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularSize, textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { myContentBottomPlacements } from '../selectors';
import { contentTextWidth } from '../../components/constants';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div`
  background-color: #1a9173;
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 2rem 0;
  max-width: ${contentTextWidth}rem;
  overflow: visible;
`;

const Title = styled.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: white;
  float: left;
`;

const Blurb = styled.div`
  font-size: 1.3rem;
  color: white;
  ${textRegularStyle}
  line-height: 1.7rem;
  flex: 1;
  align-self: stretch;
  color: white;
  float: left;
`;

const ButtonWrapper = styled.div`
  float: right;
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
  color: white;
  background-color: ${theme.color.primary.orange.base};
  font-weight: 700;
`;

// tslint:disable-next-line: variable-name
const ContentBottomPlacement = () => {
  const placements = useSelector(myContentBottomPlacements);
  const placement = placements[Math.floor(Math.random()*placements.length)];

  if (!placement) { return null; }

  const config = placement.config as ContentBottomConfig;

  return <Wrapper>
    <Body>
      <Title>
        {config.title}
      </Title>
      <Blurb>
        {config.blurb}
      </Blurb>
      <ButtonWrapper>
        <ButtonLink
          // aria-label={formatMessage({id: 'i18n:toolbar:buy-book:aria-label:text'})} // TODO: what to do here?
          target='_blank'
          rel='noopener'
          href={config.url}
          data-analytics-label='content-bottom-placement'
        >
          {config.button}
        </ButtonLink>
      </ButtonWrapper>
    </Body>
  </Wrapper>;
};

export default ContentBottomPlacement;
