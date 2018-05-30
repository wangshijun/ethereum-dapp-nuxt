import React from 'react';
import { Grid, Button, Typography, TextField, Paper, CircularProgress } from '@material-ui/core';

import { Router } from '../../../routes';
import web3 from '../../../libs/web3';
import Project from '../../../libs/project';
import withRoot from '../../../libs/withRoot';
import Layout from '../../../components/Layout';

class PaymentCreate extends React.Component {
  static async getInitialProps({ query }) {
    const contract = Project(query.address);

    const summary = await contract.methods.getSummary().call();
    const description = summary[0];

    return { project: { address: query.address, description } };
  }

  constructor(props) {
    super(props);

    this.state = {
      description: '',
      amount: 0,
      receiver: 0,
      errmsg: '',
      loading: false,
    };

    this.onSubmit = this.createPayment.bind(this);
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
  }

  async createPayment() {
    const { description, amount, receiver } = this.state;
    console.log(this.state);

    // 字段合规检查
    if (!description) {
      return this.setState({ errmsg: '支出理由不能为空' });
    }
    if (amount <= 0) {
      return this.setState({ errmsg: '支出金额必须大于0' });
    }
    if (!receiver) {
      return this.setState({ errmsg: '收款人不能为空' });
    }

    const amountInWei = web3.utils.toWei(amount, 'ether');

    try {
      this.setState({ loading: true, errmsg: '' });

      // 获取账户
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];

      // 创建项目
      const contract = Project(this.props.project.address);
      const result = await contract.methods
        .createPayment(description, amountInWei, receiver)
        .send({ from: owner, gas: '5000000' });

      this.setState({ errmsg: '资金支出请求创建成功' });
      console.log(result);

      setTimeout(() => {
        Router.pushRoute(`/projects/${this.props.project.address}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      this.setState({ errmsg: err.message || err.toString });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <Layout>
        <Typography variant="title" color="inherit" style={{ marginTop: '15px' }}>
          创建资金支出请求：{this.props.project.description}
        </Typography>
        <Paper style={{ width: '60%', padding: '15px', marginTop: '15px' }}>
          <form noValidate autoComplete="off" style={{ marginBottom: '15px' }}>
            <TextField
              fullWidth
              required
              id="description"
              label="支出理由"
              value={this.state.description}
              onChange={this.getInputHandler('description')}
              margin="normal"
            />
            <TextField
              fullWidth
              required
              id="amount"
              label="支出金额"
              value={this.state.amount}
              onChange={this.getInputHandler('amount')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
            <TextField
              fullWidth
              required
              id="receiver"
              label="收款方"
              value={this.state.maxInvest}
              onChange={this.getInputHandler('receiver')}
              margin="normal"
            />
          </form>
          <Button variant="raised" size="large" color="primary" onClick={this.onSubmit}>
            {this.state.loading ? <CircularProgress color="secondary" size={24} /> : '保存'}
          </Button>
          {!!this.state.errmsg && (
            <Typography component="p" style={{ color: 'red' }}>
              {this.state.errmsg}
            </Typography>
          )}
        </Paper>
      </Layout>
    );
  }
}

export default withRoot(PaymentCreate);
