export const treeWithoutUnits = {
  contents: [
    {
      id: 'preface@1',
      slug: 'preface',
      title: '<span class="os-divider"> </span><span class="os-text">preface</span>',
    },
    {
      contents: [
        {
          id: 'page1@1',
          slug: '1-1-page-1',
          title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
        },
        {
          id: 'page2@1',
          slug: '1-2-page-2',
          title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
        },
        {
          contents: [
            {
              id: 'reviewpage@1',
              slug: 'review-page',
              title: '<span class="os-text">review page</span>',
            },
          ],
          id: 'review@1',
          slug: 'chapter-review',
          title: '<span class="os-text">chapter review</span>',
        },
      ],
      id: 'chapter1@1',
      slug: '1-chapter-1',
      title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
    },
    {
      id: 'appendix@1',
      slug: 'a-appendix',
      title: '<span class="os-number">A</span><span class="os-divider"> | </span><span class="os-text">Appendix</span>',
    },
  ],
  id: 'bookid@1',
  slug: 'cool-book',
  title: '<span class="os-text">cool book</span>',
};
export const treeWithUnits = {
  contents: [
    {
      id: 'preface@1',
      slug: 'preface',
      title: '<span class="os-divider"> </span><span class="os-text">preface</span>',
    },
    {
      contents: [
        {
          contents: [
            {
              id: 'page1@1',
              slug: '1-1-page-1',
              title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
            },
            {
              id: 'page2@1',
              slug: '1-2-page-2',
              title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
            },
          ],
          id: 'chapter1@1',
          slug: '1-chapter-1',
          title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
        },
        {
          contents: [
            {
              id: 'page1@1',
              slug: '2-1-page-1',
              title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
            },
            {
              id: 'page2@1',
              slug: '2-2-page-2',
              title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
            },
          ],
          id: 'chapter2@1',
          slug: '1-chapter-2',
          title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
        },
      ],
      id: 'unitid@1',
      slug: 'some-unit',
      title: '<span class="os-text">some unit</span>',
    },
  ],
  id: 'bookid@1',
  slug: 'cool-book',
  title: '<span class="os-text">cool book</span>',
};

export const treeWithDropdowns = {
  contents: [
    {
      id: 'preface@1',
      slug: 'preface',
      title: '<span class="os-divider"> </span><span class="os-text">preface</span>',
    },
    {
      contents: [
        {
          id: 'page1@1',
          slug: '1-1-page-1',
          title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
        },
        {
          id: 'page2@1',
          slug: '1-2-page-2',
          title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
        },
        {
          contents: [
            {
              id: 'keyterms@1',
              slug: 'keyterms-1',
              title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">key terms</span>',
            },
            {
              id: 'keyequations@1',
              slug: 'keyequations-2',
              title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">key equations</span>',
            },
          ],
          id: 'review@1',
          slug: 'chapter-review',
          title: '<span class="os-divider"> </span><span class="os-text">chapter review</span>',
        },
      ],
      id: 'chapter1@1',
      slug: '1-chapter-1',
      title: '<span class="os-number">1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
    },
    {
      id: 'appendix@1',
      slug: 'a-appendix',
      title: '<span class="os-number">A</span><span class="os-divider"> | </span><span class="os-text">Appendix</span>',
    },
    {
      contents: [
        {
          id: 'chapter1@1',
          slug: 'chapter-1',
          title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">chapter 1</span>',
        },
        {
          id: 'chapter2@1',
          slug: 'chapter 2',
          title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">chapter 2</span>',
        },
      ],
      id: 'answerkey@1',
      slug: 'answer-key',
      title: '<span class="os-divider"> </span><span class="os-text">answer key</span>',
    },
  ],
  id: 'bookid@1',
  slug: 'cool-book',
  title: '<span class="os-text">cool book</span>',
};
