import styled from 'styled-components';
import MainContent from '../../components/MainContent';
import { bookBannerDesktopHeight } from './BookBanner';
import { toolbarDesktopHeight } from './Toolbar';

export default styled(MainContent)`
  flex: 1;
  overflow: hidden;

  *:target:before {
    content: " ";
    display: block;
    position: relative;
    margin-top: -${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
    height: ${bookBannerDesktopHeight + toolbarDesktopHeight}rem;
    visibility: hidden;
  }
`;
