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
