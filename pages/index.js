import React from 'react';
import Web3 from 'web3';
import { Button } from '@material-ui/core';

import withRoot from '../libs/withRoot';
import Layout from '../components/Layout';

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
    };
  }

  async componentDidMount() {
    const web3 = new Web3(window.web3.currentProvider);
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    this.setState({ accounts });
  }

  render() {
    const { accounts } = this.state;

    return (
      <Layout>
        <ul>{accounts.map(x => <li key={x}>{x}</li>)}</ul>
      </Layout>
    );
  }
}

export default withRoot(Index);
