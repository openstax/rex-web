import React from 'react';
import { useSelector } from 'react-redux';
import {v4 as uuid } from 'uuid';
import * as selectAuth from '../../auth/selectors';
import AccessibilityButtonsWrapper from '../../components/AccessibilityButtonsWrapper';
import ErrorBoundary from '../../errors/components/ErrorBoundary';
import ErrorModal from '../../errors/components/ErrorModal';
import * as selectNavigation from '../../navigation/selectors';
import { assertString } from '../../utils/assertions';
import * as selectContent from '../selectors';
import { ArchiveTreeSection, Book } from '../types';
import { findArchiveTreeNodeById, getTitleStringFromArchiveNode } from '../utils/archiveTreeUtils';
import { stripIdVersion } from '../utils/idUtils';
import Page from './Page';
import { PrevNextBar } from './PrevNextBar';

export default () => {
  const book = useSelector(selectContent.book);
  const page = useSelector(selectContent.page);
  const {redirect, activity, attempt, parent, sections} = useSelector(selectNavigation.query);
  const user = useSelector(selectAuth.user);
  const [readingAttemptId, setReadingAttemptId] = React.useState<string>();
  const [readingCompletedId, setReadingCompletedId] = React.useState<string>();

  const sectionsArray = React.useMemo(() => {
    return typeof sections === 'string'
      ? [sections]
      : sections instanceof Array
        ? sections
        : [];
  }, [sections]);

  React.useEffect(() => {
    if (user
      && !readingAttemptId
      && typeof parent === 'string' && typeof attempt === 'string' && typeof activity === 'string'
    ) {
      putXapiAttemptedStatement(user, {parent, attempt, activity})
        .then((response) => response.json())
        .then((statementids) => setReadingAttemptId(statementids[0]))
      ;
    }
  }, [user, parent, attempt, activity, readingAttemptId]);

  // TODO - probably some more criteria, like having visited every section
  React.useEffect(() => {
    if (user
      && readingAttemptId
      && page && page.id === sectionsArray[sectionsArray.length - 1]
      && !readingCompletedId
      && typeof parent === 'string' && typeof attempt === 'string' && typeof activity === 'string'
    ) {
      putXapiCompletedStatement(user, {parent, attempt, activity})
        .then((response) => response.json())
        .then((statementids) => setReadingCompletedId(statementids[0]))
      ;
    }
  }, [user, page, sectionsArray, parent, attempt, activity, readingAttemptId, readingCompletedId]);

  React.useEffect(() => {
    if (user
      && book && page
      && readingAttemptId
      && typeof parent === 'string' && typeof attempt === 'string' && typeof activity === 'string'
    ) {
      putXapiReadStatement(user, book, page, {parent: activity, attempt: readingAttemptId});
    }
  }, [user, book, page, parent, attempt, activity, readingAttemptId]);

  const prevNext = React.useMemo(() => {
    if (!page || !book) {
      return null;
    }
    const currentIndex = sectionsArray.findIndex((id) => page.id === id);

    const previousId = sectionsArray[currentIndex - 1];
    const nextId = sectionsArray[currentIndex + 1];

    const prev = previousId ? findArchiveTreeNodeById(book.tree, previousId)! : undefined;
    const next = nextId ? findArchiveTreeNodeById(book.tree, nextId)! : undefined;
    const finished = next ? undefined : typeof redirect === 'string' ? redirect : undefined;

    return prev || next || finished ? {prev, next, finished} : undefined;
  }, [sectionsArray, page, book, redirect]);

  return <AccessibilityButtonsWrapper>
    <ErrorModal />
    <ErrorBoundary>
      <Page>
        {prevNext ? <PrevNextBar book={book} prevNext={prevNext} /> : null}
      </Page>
    </ErrorBoundary>
  </AccessibilityButtonsWrapper>;
};

// TODO - realistically we might want to have some criteria for `read` and `completed`
const putXapiAttemptedStatement = (
  user: {uuid: string},
  context: {parent: string, activity: string, attempt: string}
) => {
  return putXapiStatements(user, [
    {
      context: {
        contextActivities: {
          parent: [
            {
              id: context.parent,
              objectType: 'Activity',
            },
          ],
        },
        platform: 'REX',
        statement: {
          id: context.attempt,
          objectType: 'StatementRef',
        },
      },
      object: {
        definition: {
          type: 'http://id.tincanapi.com/activitytype/school-assignment',
        },
        id: context.activity,
      },
      verb: {
        display: { 'en-US': 'Attempted' },
        id: 'http://adlnet.gov/expapi/verbs/attempted',
      },
    },
  ]);
};

const putXapiCompletedStatement = (
  user: {uuid: string},
  context: {parent: string, activity: string, attempt: string}
) => {
  return putXapiStatements(user, [
    {
      context: {
        contextActivities: {
          parent: [
            {
              id: context.parent,
              objectType: 'Activity',
            },
          ],
        },
        platform: 'REX',
        statement: {
          id: context.attempt,
          objectType: 'StatementRef',
        },
      },
      object: {
        definition: {
          type: 'http://id.tincanapi.com/activitytype/school-assignment',
        },
        id: context.activity,
      },
      verb: {
        display: { 'en-US': 'Completed' },
        id: 'http://adlnet.gov/expapi/verbs/completed',
      },
    },
  ]);
};

const putXapiReadStatement = (
  user: {uuid: string},
  book: Book,
  sectionNode: ArchiveTreeSection,
  context: {parent: string, attempt: string}
) => {
  return putXapiStatements(user, [
    {
      context: {
        contextActivities: {
          parent: [
            {
              id: context.parent,
              objectType: 'Activity',
            },
          ],
        },
        platform: 'REX',
        statement: {
          id: context.attempt,
          objectType: 'StatementRef',
        },
      },
      object: {
        definition: {
          name: {
            'en-US': getTitleStringFromArchiveNode(book, sectionNode),
          },
          type: 'http://id.tincanapi.com/activitytype/chapter',
        },
        id: `http://openstax.org/books/${book.id}/pages/${stripIdVersion(sectionNode.id)}`,
      },
      verb: {
        display: { 'en-US': 'Read' },
        id: 'http://activitystrea.ms/schema/1.0/read',
      },
    },
  ]);
};

const putXapiStatements = (
  user: {uuid: string},
  statements: Array<{
    id?: string;
    object: {definition: {name?: {[key: string]: string}, type: string}, id: string};
    verb: {display: {[key: string]: string}, id: string};
    context: any; // TODO - look for an xapi ts client
  }>
) => {
  return fetch(process.env.REACT_APP_LRS_HOST + 'data/xAPI/statements', {
    body: JSON.stringify(statements.map((statement) => ({
      actor: {
        account: {
          homePage: 'https://openstax.org',
          name: user.uuid,
        },
        objectType: 'Agent',
      },
      id: uuid(),
      ...statement,
      // result: {
      //  completion: true,
      //  duration: 'P1M', //  ISO 8601
      // },
    }))),
    headers: {
      'Authorization': assertString(process.env.REACT_APP_LRS_AUTHORIZATION, 'must provider lrs authorization header'),
      'Content-Type': 'application/json',
      'X-Experience-API-Version': '1.0.0',
    },
    method: 'POST',
  });
};
