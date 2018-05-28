import React from 'react';
import { Button } from '@material-ui/core';
import withRoot from '../libs/withRoot';

class Index extends React.Component {
  render() {
    return <Button variant="raised" color="primary">Welcome to Ethereum ICO DApp!</Button>;
  }
}

export default withRoot(Index);
