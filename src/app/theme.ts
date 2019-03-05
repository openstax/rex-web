// based on https://sketchviewer.com/sketches/59766aabb57e8900114c89ce/latest/

// TODO - as more styles are developed, try to centralize some configurations in this theme:
//  - font faces and sizes. headings, buttons, other text elements share a lot of this

export interface ColorSet {
  base: string;
  darker: string;
  darkest: string;
  foreground: string;
}

const textColors = {
  default: '#424242',
  label: '#6f6f6f',
  white: '#fff',
};

const contentBuffer = {
  default: {
    padding: '0 15.5rem',
  },
  toolbar: {
    padding: '0 13.5rem',
  },

  mobile: {
    default: {
      padding: '0 1.6rem',
    },
  },
}

const color = {
  neutral: {
    base: '#fff',
    darker: '#f1f1f1',
    darkest: '#e5e5e5',
    foreground: textColors.default,
  },
  primary: {
    blue: {
      base: '#002468',
      foreground: textColors.white,
    },
    gray: {base: '#5e6062'},
    green: {base: '#63a524'},
    orange: {
      base: '#f36b32',
      darker: '#e96128',
      darkest: '#df571e',
      foreground: textColors.white,
    },
    yellow: {base: '#f4d019'},
  },
  secondary: {
    deepGreen: {base: '#0c9372'},
    gold: {base: '#fdbd3e'},
    lightBlue: {base: '#0dc0dc'},
    lightGray: {
      base: '#959595',
      darker: '#8b8b8b',
      darkest: '#818181',
      foreground: textColors.white,
    },
    red: {base: '#c22032'},
  },
  text: textColors,
};

export default {
  breakpoint: {
    mobile: 600,
  },
  color,
  contentBuffer,
};
