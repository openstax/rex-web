import React from 'react';
import styled from 'styled-components/macro';
import Footer from '../../components/Footer';
import Layout, { LayoutBody } from '../../components/Layout';
import { textRegularStyle } from '../../components/Typography';
import { contentWrapperMaxWidth } from '../../content/components/constants';
import DisplayNotifications from '../../notifications/components/Notifications';

// tslint:disable-next-line:variable-name
const Wrapper = styled(LayoutBody)`
  flex: 1;
  ${textRegularStyle}
  max-width: ${contentWrapperMaxWidth}rem;
  margin: 0 auto;
  padding: 2rem 0;
`;

// tslint:disable-next-line:variable-name
const DeveloperLayout: React.SFC = ({children}) => <Layout>
  <DisplayNotifications />
  <Wrapper>
    {children}
  </Wrapper>
  <Footer />
</Layout>;

export default DeveloperLayout;
