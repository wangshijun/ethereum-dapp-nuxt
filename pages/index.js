import React from 'react';
import { Grid, Button, Typography, Card, CardContent, CardActions } from '@material-ui/core';

import { Link } from '../routes';
import web3 from '../libs/web3';
import ProjectList from '../libs/projectList';
import withRoot from '../libs/withRoot';
import Layout from '../components/Layout';

class Index extends React.Component {
  static async getInitialProps({ req }) {
    const projects = await ProjectList.methods.getProjects().call();
    return { projects };
  }

  render() {
    const { projects } = this.props;

    return (
      <Layout>
        <Grid container spacing={16}>
          {projects.map(this.renderProject)}
        </Grid>
      </Layout>
    );
  }

  renderProject(project) {
    return (
      <Grid item md={4} key={project}>
        <Card>
          <CardContent>
            <Typography gutterBottom variant="headline" component="h2">
              {project}
            </Typography>
            <Typography component="p">{project}</Typography>
          </CardContent>
          <CardActions>
            <Link route={`/projects/${project}`}>
              <Button size="small" color="primary">
                立即投资
              </Button>
            </Link>
            <Link route={`/projects/${project}`}>
              <Button size="small" color="secondary">
                查看详情
              </Button>
            </Link>
          </CardActions>
        </Card>
      </Grid>
    );
  }
}

export default withRoot(Index);
