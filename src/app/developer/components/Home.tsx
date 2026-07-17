import React from 'react';
import Footer from '../../components/Footer';
import Layout, { LayoutBody } from '../../components/Layout';
import { H1 } from '../../components/Typography';
import DisplayNotifications from '../../notifications/components/Notifications';
import Books from './Books';
import Notifications from './Notifications';
import Routes from './Routes';
import './Home.css';

function Home() {
  return (
    <Layout>
      <DisplayNotifications />
      <LayoutBody className="developer-home-wrapper">
        <div className="developer-home-style">
          <H1>REX Developer Homepage</H1>
          <div className="developer-home-row">
            <div className="developer-home-col">
              <Notifications />
              <Routes />
            </div>
            <div className="developer-home-col">
              <Books />
            </div>
          </div>
        </div>
      </LayoutBody>
      <Footer />
    </Layout>
  );
}

export default Home;
