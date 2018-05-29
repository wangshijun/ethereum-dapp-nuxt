import React from 'react';
import { Button } from '@material-ui/core';

import web3 from '../libs/web3';
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
    const accounts = await web3.eth.getAccounts();
    const balances = await Promise.all(accounts.map(x => web3.eth.getBalance(x)));
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
              {x.account} => {web3.utils.fromWei(x.balance, 'ether')} ETH
            </li>
          ))}
        </ul>
      </Layout>
    );
  }
}

export default withRoot(Index);
