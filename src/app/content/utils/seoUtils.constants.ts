// tslint:disable: object-literal-sort-keys max-line-length
export const mockBook = {
    title: 'JavaScript Testing',
    id: '',
    license: {
        name: '',
        url: '',
        version: '',
    },
    version: '',
    revised: '',
    tree: {
        id: '123',
        title: 'JavaScript Testing',
        slug: 'javascript-testing-slug',
        contents: [
            {
                id: '1',
                title: '<span data-type="" itemprop="" class="os-text">Introduction</span>',
                slug: 'introduction-slug',
            },
            {
                id: '2',
                title: '<span class="os-number"><span class="os-part-text">Chapter </span>1</span><span class="os-divider"> </span><span data-type="" itemprop="" class="os-text">What is a test?</span>',
                slug: '1-what-is-a-test-slug',
                contents: [
                    {
                        id: '1',
                        title: '<span data-type="" itemprop="" class="os-text">Some Stuff</span>',
                        slug: '1-1-some-stuff-slug',
                    },
                    {
                        id: '2',
                        title: '<span data-type="" itemprop="" class="os-text">Other Stuff</span>',
                        slug: '1-2-other-stuff-slug',
                    },
                ],
            },
            {
                id: '3',
                title: '<span class="os-number"><span class="os-part-text">Chapter </span>2</span><span class="os-divider"> </span><span data-type="" itemprop="" class="os-text">Unit Testing</span>',
                slug: '2-unit-testing',
                contents: [
                    {
                        id: '1',
                        title: '<span data-type="" itemprop="" class="os-text">Jest</span>',
                        slug: '1-1-jest-slug',
                    },
                    {
                        id: '2',
                        title: '<span data-type="" itemprop="" class="os-text">Mocha</span>',
                        slug: '1-2-mocha-slug',
                    },
                ],
            },
        ],
    },
};

export const contentPage = {
    title: 'Introduction',
    content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="page" id="1d1fd537-77fb-4eac-8a8a-60bbaa747b6d" class="introduction" data-cnxml-to-html-ver="2.1.0"><p>For example, take a look at the image above. This image is of the Andromeda Galaxy, which contains billions of individual stars, huge clouds of gas, and dust. Two smaller galaxies are also visible as bright blue spots in the background. At a staggering 2.5 million light years from the Earth, this galaxy is the nearest one to our own galaxy (which is called the Milky Way). The stars and planets that make up Andromeda might seem to be the furthest thing from most people’s regular, everyday lives. But Andromeda is a great starting point to think about the forces that hold together the universe.</p><p>The forces that cause Andromeda to act as it does are the same forces we contend with here on Earth, whether we are planning to send a rocket into space or simply raise the walls for a new home. The same gravity that causes the stars of Andromeda to rotate and revolve also causes water to flow over hydroelectric dams here on Earth. Tonight, take a moment to look up at the stars. The forces out there are the same as the ones here on Earth. Through a study of physics, you may gain a greater understanding of the interconnectedness of everything we can see and know in this universe.</p></div></body></html>',
    abstract: '',
    id: '1',
    version: '',
    revised: '',
};

export const contentPageShort = {
    title: 'Unit Testing',
    content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="page" id="1d1fd537-77fb-4eac-8a8a-60bbaa747b6d" data-cnxml-to-html-ver="2.1.0"><p>Two smaller galaxies are also visible as bright blue spots in the background.</p></div></body></html>',
    abstract: '',
    id: '',
    version: '2',
    revised: '',
};

export const contentPageWithObjectives = {
    title: 'Integration Testing',
    content: '<html xmlns="http://www.w3.org/1999/xhtml"><body><div data-type="page" id="1d1fd537-77fb-4eac-8a8a-60bbaa747b6d" data-cnxml-to-html-ver="2.1.0"><section class="learning-objectives"><h3 data-type="title">Learning Objectives</h3><p>By the end of this section, you will be able to:</p><ul><li>Explain the importance of citizen engagement in a democracy</li></ul></section><p>The forces that cause Andromeda to act as it does are the same forces we contend with here on Earth, whether we are planning to send a rocket into space or simply raise the walls for a new home. The same gravity that causes the stars of Andromeda to rotate and revolve also causes water to flow over hydroelectric dams here on Earth.</p></div></body></html>',
    abstract: '',
    id: '',
    version: '2',
    revised: '',
};
