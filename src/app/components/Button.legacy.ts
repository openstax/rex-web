/**
 * Legacy styled-components exports for Button components
 *
 * This file provides backward-compatible styled-components wrappers for the new plain CSS Button components.
 * These exports allow existing code to continue using styled-components patterns while the underlying
 * implementation uses plain CSS.
 *
 * @deprecated These exports are for backward compatibility only. New code should import directly from ./Button
 * and use plain CSS className composition instead of styled-components.
 */

import styled from 'styled-components/macro';
import { Button as ButtonBase, PlainButton as PlainButtonBase, ButtonGroup as ButtonGroupBase, ButtonLink as ButtonLinkBase } from './Button';

// Legacy styled-components wrapper for Button
// Allows existing code to use: styled(Button)`...` or <Button as={SomeStyledComponent} />
export const Button = styled(ButtonBase)``;

// Legacy styled-components wrapper for PlainButton
// Allows existing code to use: styled(PlainButton)`...`
export const PlainButton = styled(PlainButtonBase)``;

// Legacy styled-components wrapper for ButtonGroup
// Allows existing code to use: styled(ButtonGroup)`...`
export const ButtonGroup = styled(ButtonGroupBase)``;

// Legacy styled-components wrapper for ButtonLink
// Allows existing code to use: styled(ButtonLink)`...`
export const ButtonLink = styled(ButtonLinkBase)``;

export default Button;
