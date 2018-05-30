import React from 'react';
import { Grid, Button, Typography, LinearProgress, Paper } from '@material-ui/core';

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
    };

    return { project };
  }

  render() {
    const { project } = this.props;

    return (
      <Layout>
        <Typography variant="title" color="inherit" style={{ margin: '15px 0' }}>
          项目详情
        </Typography>
        {this.renderBasicInfo(project)}
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
      </Paper>
    );
  }
}

export default withRoot(ProjectDetail);
