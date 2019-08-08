import React from 'react';
import { connect } from 'react-redux';
import RouteLink from '../../components/RouteLink';
import { H1 } from '../../components/Typography';
import { Book } from '../../content/types';
import { AppState } from '../../types';
import { auditTocHistory, cnxLinkMapping } from '../routes';
import Layout from './Layout';

interface Props {book?: Book; }

// tslint:disable-next-line:variable-name
const Tools = ({book}: Props) => book
  ? <Layout>
      <H1>{book.title}</H1>
      <ul>
        <li>
          <RouteLink match={{
            params: {book: book.id},
            route: cnxLinkMapping,
          }}>cnx link map</RouteLink>
        </li>
        <li>
          <RouteLink match={{
            params: {book: book.id},
            route: auditTocHistory,
          }}>audit toc history</RouteLink>
        </li>
      </ul>
    </Layout>
  : <Layout>loading...</Layout>;

export default connect(
  (state: AppState) => ({
    book: state.developer.book,
  })
)(Tools);
