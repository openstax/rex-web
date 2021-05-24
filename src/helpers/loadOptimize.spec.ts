import { Store } from "../app/types";
import { assertWindow } from "../app/utils";
import createTestStore from "../test/createTestStore";
import loadOptimize from "./loadOptimize";
import * as loadOptimizeFile from "./loadOptimize";

describe("loadOptimize", () => {
  let store: Store;
  let gtag: (eventKey: string, eventVal: string, eventObj: object) => boolean;
  let window: Window;

  beforeEach(() => {
    store = createTestStore();
    window = assertWindow();

    gtag = window.gtag = jest.fn();
    window.dataLayer = [];

    if (typeof document === "undefined") {
      throw new Error("JSDom not loaded");
    }

    const createEvent = document.createEvent.bind(document);
    const originalCreateElement = document.createElement.bind(document);

    document.createElement = jest.fn((type: string) => {
      const element = originalCreateElement(type);
      const event = createEvent("Event");
      event.initEvent("load");
      setTimeout(() => element.onload && element.onload(event), 1);

      return element;
    });
  });

  it("injects <script> into head", async () => {
    await loadOptimize(window, store);

    jest
      .spyOn(loadOptimizeFile, "getOptimizeContainerByEnv")
      .mockReturnValue("OPT-W65B3CP");

    if (document && document.head) {
      expect(document.head.innerHTML).toMatchInlineSnapshot(`
        "<style data-styled=\\"\\" data-styled-version=\\"4.3.2\\">
        /* sc-component-id: StyledIconBase-sc-bdy9j4 */

        /* sc-component-id: headings__H1-sc-1xfiggv-0 */

        /* sc-component-id: headings__H2-sc-1xfiggv-1 */

        /* sc-component-id: headings__H3-sc-1xfiggv-2 */

        /* sc-component-id: styled__FBIcon-y5hgq4-0 */

        /* sc-component-id: styled__TwitterIcon-y5hgq4-1 */

        /* sc-component-id: styled__IGIcon-y5hgq4-2 */

        /* sc-component-id: styled__LinkedInIcon-y5hgq4-3 */

        /* sc-component-id: styled__FooterWrapper-y5hgq4-4 */

        /* sc-component-id: styled__InnerFooter-y5hgq4-5 */

        /* sc-component-id: styled__FooterTop-y5hgq4-6 */

        /* sc-component-id: styled__TopBoxed-y5hgq4-7 */

        /* sc-component-id: styled__Heading-y5hgq4-8 */

        /* sc-component-id: styled__Mission-y5hgq4-9 */

        /* sc-component-id: styled__FooterLink-y5hgq4-10 */

        /* sc-component-id: styled__BottomLink-y5hgq4-11 */

        /* sc-component-id: styled__Column1-y5hgq4-12 */

        /* sc-component-id: styled__Column2-y5hgq4-13 */

        /* sc-component-id: styled__Column3-y5hgq4-14 */

        /* sc-component-id: styled__ColumnHeading-y5hgq4-15 */

        /* sc-component-id: styled__FooterBottom-y5hgq4-16 */

        /* sc-component-id: styled__BottomBoxed-y5hgq4-17 */

        /* sc-component-id: styled__Copyrights-y5hgq4-18 */

        /* sc-component-id: styled__Social-y5hgq4-19 */

        /* sc-component-id: styled__SocialIcon-y5hgq4-20 */

        /* sc-component-id: styled__FooterLogo-y5hgq4-21 */

        /* sc-component-id: ErrorIdList-sc-1coujqm-0 */

        /* sc-component-id: ErrorBoundary__ErrorWrapper-sc-1xs0836-0 */

        /* sc-component-id: ErrorBoundary__HeadingWrapper-sc-1xs0836-1 */

        /* sc-component-id: ErrorBoundary__BodyErrorText-sc-1xs0836-2 */
        </style><script type=\\"text/javascript\\" src=\\"https://www.googleoptimize.com/optimize.js?id=OPT-W65B3CP\\"></script>"
      `);
    } else if (document) {
      expect(document).toBeTruthy();
      expect(document.head).toBeTruthy();
    } else {
      expect(document).toBeTruthy();
    }
  });
});
