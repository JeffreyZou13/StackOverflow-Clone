import React, { Component } from 'react';

class logout extends Component {

  handleLogin = () => {
    this.props.history.push('/login')
  }

  handleRegister = () => {
    this.props.history.push('/adduser')
  }

  render() {    
    return (
      <div>
        <header>
          <link rel="stylesheet" href="style/styles.css"></link>
        </header>
        <h1>YOU ARE LOGGED OUT...</h1>
        <button id="login" onClick={this.handleLogin}>Log Back In!</button> 
        <button id="register" onClick={this.handleRegister}>Register</button> 
      </div>
    );
  } 
}

export default logout