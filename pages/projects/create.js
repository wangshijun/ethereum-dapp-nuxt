import React from 'react';
import { Grid, Button, Typography, TextField, Paper } from '@material-ui/core';

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
    };
  }

  getInputHandler(key) {
    return e => {
      console.log(e.target.value);
      this.setState({ [key]: e.target.value });
    };
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
              value={this.state.maxInvest}
              onChange={this.getInputHandler('goal')}
              margin="normal"
              InputProps={{ endAdornment: 'ETH' }}
            />
          </form>
          <Button variant="raised" size="large" color="primary">
            创建项目
          </Button>
        </Paper>
      </Layout>
    );
  }
}

export default withRoot(ProjectCreate);
