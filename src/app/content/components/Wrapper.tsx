import styled from 'styled-components';

export default styled.div`
  margin: 0 auto;
  display: block;
  padding: 0 6rem 0 6rem;
  min-height: 6rem;
  outline: none;

  // this stuff could be in a reset.css
  h1 {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.4);
    color-interpolation: sRGB;
    color-interpolation-filters: linearRGB;
    word-wrap: normal;
  }

  // these are only here because the cnx-recipes styles are broken
  font-size: 18px;
  font-family: "Noto Sans", sans-serif;
`;
