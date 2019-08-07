import React from 'react';
import { H1 } from '../../components/Typography';
import Books from './Books';
import Layout from './Layout';
import Notifications from './Notifications';
import Routes from './Routes';

// tslint:disable-next-line:variable-name
const Home: React.SFC = () => <Layout>
  <H1>REX Developer Homepage</H1>
  <Books />
  <Notifications />
  <Routes />
</Layout>;

export default Home;
