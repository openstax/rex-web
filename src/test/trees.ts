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
          // tslint:disable-next-line:max-line-length
          title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
        },
        {
          id: 'page2@1',
          slug: '1-2-page-2',
          // tslint:disable-next-line:max-line-length
          title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
        },
        {
          contents: [
            {
              id: 'reviewpage@1',
              slug: 'review-page',
              // tslint:disable-next-line:max-line-length
              title: '<span class="os-text">review page</span>',
            },
          ],
          id: 'review@1',
          slug: 'chapter-review',
          // tslint:disable-next-line:max-line-length
          title: '<span class="os-text">chapter review</span>',
        },
      ],
      id: 'chapter1@1',
      slug: '1-chapter-1',
      // tslint:disable-next-line:max-line-length
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
              // tslint:disable-next-line:max-line-length
              title: '<span class="os-number">1.1</span><span class="os-divider"> </span><span class="os-text">page 1</span>',
            },
            {
              id: 'page2@1',
              slug: '1-2-page-2',
              // tslint:disable-next-line:max-line-length
              title: '<span class="os-number">1.2</span><span class="os-divider"> </span><span class="os-text">page 2</span>',
            },
          ],
          id: 'chapter1@1',
          slug: '1-chapter-1',
          // tslint:disable-next-line:max-line-length
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
