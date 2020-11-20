import { resolve } from 'path';
import { deleteFile, touchFile } from '../helpers/fileUtils';
import createPracticeQuestionsLoader from './createPracticeQuestionsLoader';

describe('createPracticeQuestionsLoader', () => {
  const bookId = 'somebook';
  const sourceId = 'somepage';

  const summaryFile = resolve(__dirname, `../../data/practice/summary/${bookId}.json`);
  const questionFile = resolve(__dirname, `../../data/practice/questions/${bookId}/${sourceId}.json`);

  beforeAll(() => {
    touchFile(summaryFile);
    touchFile(questionFile);
  });

  afterAll(() => {
    deleteFile(summaryFile);
    deleteFile(questionFile);
  });

  it('returns json with summary if it exists', async() => {
    const loader = createPracticeQuestionsLoader();

    jest.doMock(`../../data/practice/summary/${bookId}.json`, () => ({
      countsPerSource: {
        someuuid: 4,
      },
    }));

    expect(await loader.getPracticeQuestionsBookSummary(bookId))
      .toEqual({countsPerSource: {someuuid: 4}})
    ;
  });

  it('returns undefined if there is no summary json for passed id', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestionsBookSummary('this-does-not-exists')).toEqual(undefined);
  });

  it('returns questions for existing bookId and sectionId', async() => {
    const loader = createPracticeQuestionsLoader();
    const stub = [{
      answers: [
        {
          content_html: 'Inertia is an object’s tendency to maintain its mass.',
          correctness: '0.0',
          feedback_html: 'Is the inertia of an object related to its mass?',
          id: 375060,
        },
      ],
      group_uuid: '5583b4e2-cf57-4769-834d-4a96a370caa2',
      stem_html: 'What is inertia?',
      tags: '5583b4e2-cf57-4769-834d-4a96a370caa2',
      uid: '2079@5',
    }];

    jest.doMock(`../../data/practice/questions/${bookId}/${sourceId}.json`, () => stub);

    const questions = await loader.getPracticeQuestions(bookId, sourceId);

    expect(questions).toBe(stub);
  });

  it('returns undefined for existing bookId and not existing sectionId', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestions(bookId, 'wrong')).toEqual(undefined);
  });

  it('returns undefined for not existing bookId and existing sectionId', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestions('wrong', sourceId)).toEqual(undefined);
  });
});
