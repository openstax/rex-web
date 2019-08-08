import flow from 'lodash/fp/flow';
import React from 'react';
import { connect } from 'react-redux';
import { push } from '../navigation/actions';
import { AnyMatch } from '../navigation/types';
import { matchUrl } from '../navigation/utils';
import { Dispatch } from '../types';

interface Props {
  children: React.ReactNode;
  match: AnyMatch;
  navigate: typeof push;
}

function RouteLink({match, navigate, children}: Props) {
  return <a
    href={matchUrl(match)}
    onClick={(e) => {
      if (e.metaKey) {
        return;
      }
      e.preventDefault();
      navigate(match);
    }}
  >{children}</a>;
}

export default connect(
  () => ({
  }),
  (dispatch: Dispatch) => ({
    navigate: flow(push, dispatch),
  })
)(RouteLink);
