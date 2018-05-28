import React from 'react';
import { Grid } from '@material-ui/core';

const styles = {
  display: 'flex',
  flexDirection: 'column',
  margin: '0 auto',
  width: '80%',
  maxWidth: '1200px',
  minHeight: '100vh',
};

class Layout extends React.Component {
  render() {
    return (
      <div style={styles}>
        <Grid container>
          {this.props.children}
        </Grid>
      </div>
    );
  }
}

export default Layout;
