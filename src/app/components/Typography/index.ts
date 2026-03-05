import theme from '../../theme';

// Import CSS files
import './TextStyles.css';
import './Links.css';

// Export new components
export * from './Headings';
export * from './Links';

// Export constants for backward compatibility
export const linkColor = '#027EB5';
export const linkHover = '#0064A0';
export const textRegularLineHeight = 2.5;

// Export class names as style strings for backward compatibility with styled-components usage
// These allow existing code using these in template literals to continue working
export const textStyle = 'text-style';
export const textRegularSize = 'text-regular-size';
export const textRegularStyle = 'text-regular-style';
export const bodyCopyRegularStyle = 'body-copy-regular-style';
export const labelStyle = 'label-style';
export const disabledStyle = 'disabled-style';
export const linkStyle = 'link-style';
export const decoratedLinkStyle = 'decorated-link-style';

// For code that needs to bind theme colors to CSS variables
export function getTextStyleWithTheme() {
  return {
    '--text-color': theme.color.text.default,
  };
}
