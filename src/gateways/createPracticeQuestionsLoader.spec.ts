import createPracticeQuestionsLoader from './createPracticeQuestionsLoader';

describe('createPracticeQuestionsLoader', () => {
  it('returns json with summary if it exists', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestionsBookSummary('cce64fde-f448-43b8-ae88-27705cceb0da'))
      .toMatchObject({
        countsPerSource: {
          '5f0710fe-1028-4ac4-b8fd-b0a6c792c642': 10,
          // tslint:disable-next-line: object-literal-sort-keys
          '38c45e46-b77d-44c3-8b97-846b6d2c1aa4': 13,
          '9ef016d1-21ef-46e2-9eac-dea694a1de40': 11,
          '3e280fd9-2656-4632-9b76-5ff408846a8f': 8,
          '641ee55f-ff1d-49b9-9e41-cac3d2e949c7': 6,
          '6cf03b99-04d9-4a5f-bed4-342eeb0a9732': 2,
          'f9ee275f-d930-436a-b90f-0c8f9be53677': 3,
        },
      });
  });

  it('returns undefined if there is no summary json for passed id', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestionsBookSummary('this-does-not-exists')).toEqual(undefined);
  });

  it('returns questions for existing bookId and sectionId', async() => {
    const loader = createPracticeQuestionsLoader();
    const questions = await loader.getPracticeQuestions(
      'cce64fde-f448-43b8-ae88-27705cceb0da',
      '6cf03b99-04d9-4a5f-bed4-342eeb0a9732');

    if (!questions) {
      return expect(questions).toBeDefined();
    }

    expect(questions.length).toEqual(2);
    expect(questions[0].id).toEqual(103040);
    expect(questions[0].answers.length).toEqual(2);
    expect(questions[1].id).toEqual(91840);
    expect(questions[1].answers.length).toEqual(2);
  });

  it('returns undefined for existing bookId and not existing sectionId', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestions(
      'cce64fde-f448-43b8-ae88-27705cceb0da',
      'wrong')
    ).toEqual(undefined);
  });

  it('returns undefined for not existing bookId and existing sectionId', async() => {
    const loader = createPracticeQuestionsLoader();

    expect(await loader.getPracticeQuestions(
      'wrong',
      '6cf03b99-04d9-4a5f-bed4-342eeb0a9732')
    ).toEqual(undefined);
  });
});
