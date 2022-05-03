import React from 'react';
import SearchResultsSidebar from '../search/components/SearchResultsSidebar';
import TableOfContents from './TableOfContents';
import VerticalNav from './Toolbar';

// tslint:disable-next-line:variable-name
const Navigation = () =>
  <>
    <VerticalNav />
    <TableOfContents />
    <SearchResultsSidebar />
  </>;

export default Navigation;
