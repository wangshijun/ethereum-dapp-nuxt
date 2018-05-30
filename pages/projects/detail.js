import React from 'react';
import { Grid, Button, Typography, LinearProgress, CircularProgress, Paper, TextField } from '@material-ui/core';

import { Link } from '../../routes';
import web3 from '../../libs/web3';
import Project from '../../libs/project';
import ProjectList from '../../libs/projectList';
import withRoot from '../../libs/withRoot';
import Layout from '../../components/Layout';
import InfoBlock from '../../components/InfoBlock';

class ProjectDetail extends React.Component {
  static async getInitialProps({ query }) {
    const contract = Project(query.address);

    const summary = await contract.methods.getSummary().call();
    const [description, minInvest, maxInvest, goal, balance, investorCount, paymentCount, owner] = Object.values(
      summary
    );

    const tasks = [];
    for (let i = 0; i < paymentCount; i++) {
      tasks.push(contract.methods.payments(i).call());
    }
    const payments = await Promise.all(tasks);

    const project = {
      address: query.address,
      description,
      minInvest,
      maxInvest,
      goal,
      balance,
      investorCount,
      paymentCount,
      owner,
      payments,
    };

    console.log(project);

    return { project };
  }

  constructor(props) {
    super(props);

    this.state = {
      amount: 0,
      errmsg: '',
      loading: false,
    };

    this.onSubmit = this.contributeProject.bind(this);
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
  }

  async contributeProject() {
    const { amount } = this.state;
    const { minInvest, maxInvest } = this.props.project;
    const minInvestInEther = web3.utils.fromWei(minInvest, 'ether');
    const maxInvestInEther = web3.utils.fromWei(maxInvest, 'ether');

    console.log({ amount, minInvestInEther, maxInvestInEther });

    // 字段合规检查
    if (amount <= 0) {
      return this.setState({ errmsg: '投资金额必须大于0' });
    }
    if (amount < minInvestInEther) {
      return this.setState({ errmsg: '投资金额必须大于最小投资金额' });
    }
    if (amount > maxInvestInEther) {
      return this.setState({ errmsg: '投资金额必须小于最大投资金额' });
    }

    try {
      this.setState({ loading: true, errmsg: '' });

      // 获取账户
      const accounts = await web3.eth.getAccounts();
      const owner = accounts[0];

      // 发起转账
      const contract = Project(this.props.project.address);
      const result = await contract.methods
        .contribute()
        .send({ from: owner, value: web3.utils.toWei(amount, 'ether'), gas: '5000000' });

      this.setState({ errmsg: '投资成功', amount: 0 });
      console.log(result);

      setTimeout(() => {
        location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      this.setState({ errmsg: err.message || err.toString });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { project } = this.props;

    return (
      <Layout>
        <Typography variant="title" color="inherit" style={{ margin: '15px 0' }}>
          项目详情
        </Typography>
        {this.renderBasicInfo(project)}
        <Typography variant="title" color="inherit" style={{ margin: '30px 0 15px' }}>
          资金支出请求
        </Typography>
        {this.renderPayments(project)}
      </Layout>
    );
  }

  renderBasicInfo(project) {
    const progress = project.balance / project.goal * 100;

    return (
      <Paper style={{ padding: '15px' }}>
        <Typography gutterBottom variant="headline" component="h2">
          {project.description}
        </Typography>
        <LinearProgress style={{ margin: '10px 0' }} color="primary" variant="determinate" value={progress} />
        <Grid container spacing={16}>
          <InfoBlock title={`${web3.utils.fromWei(project.goal, 'ether')} ETH`} description="募资上限" />
          <InfoBlock title={`${web3.utils.fromWei(project.minInvest, 'ether')} ETH`} description="最小投资金额" />
          <InfoBlock title={`${web3.utils.fromWei(project.maxInvest, 'ether')} ETH`} description="最大投资金额" />
          <InfoBlock title={`${project.investorCount}人`} description="参投人数" />
          <InfoBlock title={`${web3.utils.fromWei(project.balance, 'ether')} ETH`} description="已募资金额" />
        </Grid>
        <Grid container spacing={16}>
          <Grid item md={12}>
            <TextField
              required
              id="amount"
              label="投资金额"
              style={{ marginRight: '15px' }}
              value={this.state.amount}
              onChange={this.getInputHandler('amount')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
            <Button size="small" variant="raised" color="primary" onClick={this.onSubmit}>
              {this.state.loading ? <CircularProgress color="secondary" size={24} /> : '立即投资'}
            </Button>
            {!!this.state.errmsg && (
              <Typography component="p" style={{ color: 'red' }}>
                {this.state.errmsg}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  }

  renderPayments(project) {
    console.log(project);

    return (
      <Paper style={{ padding: '15px' }}>
        <Link route={`/projects/${project.address}/payments/create`}>
          <Button variant="raised" color="primary">
            创建资金支出请求
          </Button>
        </Link>
      </Paper>
    );
  }
}

export default withRoot(ProjectDetail);
