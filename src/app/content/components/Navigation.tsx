import React from 'react';
import SearchResultsSidebar from '../search/components/SearchResultsSidebar';
import TableOfContents from './TableOfContents';
import VerticalNav from './Toolbar';

const Navigation = () =>
  <>
    <VerticalNav />
    <TableOfContents />
    <SearchResultsSidebar />
  </>;

export default Navigation;
