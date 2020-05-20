import { HighlightsSummary } from '@openstax/highlighter/dist/api';
import { createStandardAction } from 'typesafe-actions';

export const receiveStudyGuides = createStandardAction('Content/StudyGuides/receive')<HighlightsSummary>();
