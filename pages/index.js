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

    this.web3 = new Web3(window.web3.currentProvider);
  }

  async componentDidMount() {
    const accounts = await this.web3.eth.getAccounts();
    const balances = await Promise.all(accounts.map(x => this.web3.eth.getBalance(x)));
    console.log({ accounts, balances });

    this.setState({ accounts: accounts.map((x, i) => ({ account: x, balance: balances[i] })) });
  }

  render() {
    const { accounts } = this.state;

    return (
      <Layout>
        <ul>
          {accounts.map(x => (
            <li key={x.account}>
              {x.account} => {this.web3.utils.fromWei(x.balance, 'ether')}
            </li>
          ))}
        </ul>
      </Layout>
    );
  }
}

export default withRoot(Index);
