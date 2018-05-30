import React from 'react';
import { Grid, Button, Typography, TextField, Paper, CircularProgress } from '@material-ui/core';

import { Link } from '../../routes';
import web3 from '../../libs/web3';
import ProjectList from '../../libs/projectList';
import withRoot from '../../libs/withRoot';
import Layout from '../../components/Layout';

class ProjectCreate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      description: '',
      minInvest: 0,
      maxInvest: 0,
      goal: 0,
      errmsg: '',
      loading: false,
    };

    this.onSubmit = this.createProject.bind(this);
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
  }

  async createProject() {
    const { description, minInvest, maxInvest, goal } = this.state;
    console.log(this.state);

    // 字段合规检查
    if (!description) {
      return this.setState({ errmsg: '项目名称不能为空' });
    }
    if (minInvest <= 0) {
      return this.setState({ errmsg: '项目最小投资金额必须大于0' });
    }
    if (maxInvest <= 0) {
      return this.setState({ errmsg: '项目最大投资金额必须大于0' });
    }
    if (maxInvest < minInvest) {
      return this.setState({ errmsg: '项目最小投资金额必须小于最大投资金额' });
    }
    if (goal <= 0) {
      return this.setState({ errmsg: '项目募资上限必须大于0' });
    }

    const minInvestInWei = web3.utils.toWei(minInvest, 'ether');
    const maxInvestInWei = web3.utils.toWei(maxInvest, 'ether');
    const goalInWei = web3.utils.toWei(goal, 'ether');

    try {
      this.setState({ loading: true, errmsg: '' });

      // 获取账户
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];

      // 创建项目
      const result = await ProjectList.methods
        .createProject(description, minInvestInWei, maxInvestInWei, goalInWei)
        .send({ from: owner, gas: '5000000' });

      this.setState({ errmsg: '项目创建成功' });
      console.log(result);
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
        <Typography variant="title" color="inherit">
          创建项目
        </Typography>
        <Paper style={{ width: '60%', padding: '15px', marginTop: '15px' }}>
          <form noValidate autoComplete="off" style={{ marginBottom: '15px' }}>
            <TextField
              fullWidth
              required
              id="description"
              label="项目名称"
              value={this.state.description}
              onChange={this.getInputHandler('description')}
              margin="normal"
            />
            <TextField
              fullWidth
              required
              id="minInvest"
              label="最小投资金额"
              value={this.state.minInvest}
              onChange={this.getInputHandler('minInvest')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
            <TextField
              fullWidth
              required
              id="maxInvest"
              label="最大投资金额"
              value={this.state.maxInvest}
              onChange={this.getInputHandler('maxInvest')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
            <TextField
              fullWidth
              required
              id="goal"
              label="募资上限"
              value={this.state.goal}
              onChange={this.getInputHandler('goal')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
          </form>
          <Button variant="raised" size="large" color="primary" onClick={this.onSubmit}>
            {this.state.loading ? <CircularProgress color="secondary" size={24} /> : '创建项目'}
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

export default withRoot(ProjectCreate);
