import styled from 'styled-components/macro';
import { TruncatedText as TruncatedTextPlain, Link as LinkPlain } from './TruncatedText.new';

/**
 * Legacy styled-components exports for backward compatibility
 */
export const Link = styled(LinkPlain)``;

export const TruncatedText = styled(TruncatedTextPlain)``;

export default TruncatedText;
