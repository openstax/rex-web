import styled from 'styled-components/macro';
import ToastNotifications from '../../../../notifications/components/ToastNotifications';

// tslint:disable-next-line:variable-name
export const HighlightEditButtons = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
  overflow: visible;

  button:first-child {
    margin-right: 8px;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightToastNotifications = styled(ToastNotifications)`
  width: 100%;
  position: absolute;
  z-index: 3;
  overflow: visible;
`;
