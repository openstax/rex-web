import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import ContentLink from '../../components/ContentLink';
import { modalQueryParameterName } from '../../constants';
import { modalUrlName } from '../../practiceQuestions/constants';
import { hasPracticeQuestions, practiceQuestionsEnabled } from '../../practiceQuestions/selectors';
import { bookAndPage } from '../../selectors';
import { toolbarIconColor } from '../constants';
import { toolbarIconStyles } from './iconStyles';
import { toolbarDefaultButton, toolbarDefaultText } from './styled';

// tslint:disable-next-line:variable-name
export const StyledPracticeQuestionsButton = styled(ContentLink)`
  ${toolbarDefaultButton}
  text-decoration: none;
  padding: 0;
  color: ${toolbarIconColor.base};

  :hover,
  :focus {
    color: ${toolbarIconColor.darker};
  }
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsIcon = styled.img`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsText = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

interface Props {
  isActive: boolean;
}

// tslint:disable-next-line:variable-name
const PracticeQuestionsButton = (props: Props) => {
  const intl = useIntl();
  const isEnabled = useSelector(practiceQuestionsEnabled);
  const trackOpenClose = useAnalyticsEvent('openClosePracticeQuestions');
  const hasPracticeQs = useSelector(hasPracticeQuestions);
  const { book, page } = useSelector(bookAndPage);

  if (!isEnabled || !hasPracticeQs || !book || !page) { return null; }

  const text = intl.formatMessage({id: 'i18n:toolbar:practice-questions:button:text'});

  return <StyledPracticeQuestionsButton
    book={book}
    page={page}
    queryParams={{ [modalQueryParameterName]: modalUrlName }}
    onClick={trackOpenClose}
    aria-label={text}
    isActive={props.isActive}>
    <PracticeQuestionsIcon aria-hidden='true' src={practiceQuestionsIcon} />
    <PracticeQuestionsText>{text}</PracticeQuestionsText>
  </StyledPracticeQuestionsButton>;
};

export default PracticeQuestionsButton;
