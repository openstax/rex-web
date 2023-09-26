import React from 'react';
import * as Styled from './styled';

export type SearchArgs = {
  onSearchSubmit(e: React.FormEvent): void;
  onSearchClear(e: React.FormEvent): void;
  onSearchChange(e: React.FormEvent): void;
  colorSchema: string | null;
  searchInSidebar: boolean;
  mobileToolbarOpen: boolean;
  openSearchResults(): void;
  toggleMobile(e: React.MouseEvent): void;
  state: {
    query: string;
    formSubmitted: boolean;
  };
  newButtonEnabled: boolean;
};

type CloseButtonArgs = Pick<
  SearchArgs,
  'newButtonEnabled' | 'onSearchClear'
> & { formSubmitted?: boolean; testid: string; desktop?: boolean };

export function CloseButton({
  newButtonEnabled,
  onSearchClear,
  formSubmitted,
  testid,
}: CloseButtonArgs) {
  // tslint:disable-next-line:variable-name
  const Tag = newButtonEnabled ? Styled.CloseButtonNew : Styled.CloseButton;

  return (
    <Tag
      type='button'
      onClick={onSearchClear}
      formSubmitted={formSubmitted}
      data-testid={testid}
    >
      {newButtonEnabled && <Styled.CloseIcon />}
    </Tag>
  );
}
