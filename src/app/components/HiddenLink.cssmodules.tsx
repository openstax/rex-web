/**
 * HiddenLink Component - CSS Modules Version
 *
 * This is an example migration demonstrating the CSS Modules infrastructure.
 * This file exists alongside the original to test the setup without breaking anything.
 *
 * Once Phase 0 is approved and all infrastructure is in place, actual migrations
 * will replace the original files rather than creating .cssmodules.tsx versions.
 */

import React from 'react';
import styles from './HiddenLink.module.css';

interface HiddenLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export const HiddenLinkCSSModules: React.FC<HiddenLinkProps> = ({ children, ...props }) => (
  <a className={styles.hiddenLink} {...props}>
    {children}
  </a>
);

interface HiddenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const HiddenButtonCSSModules: React.FC<HiddenButtonProps> = ({ children, ...props }) => (
  <button className={styles.hiddenButton} {...props}>
    {children}
  </button>
);
