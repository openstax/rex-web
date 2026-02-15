import React from 'react';
import styled, { AnyStyledComponent }from 'styled-components/macro';
import { H2 } from '../../components/Typography';

interface Props {
  title: string;
}

const Wrappper = styled.div`
  padding: 1rem;
` as AnyStyledComponent;

const Panel = ({title, children}: React.PropsWithChildren<Props>) => <div>
  <H2>{title}</H2>
  <Wrappper>
    {children}
  </Wrappper>
</div>;

export default Panel;
