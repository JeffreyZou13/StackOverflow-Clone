import React, { Component } from "react";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class login extends Component {
  constructor() {
    super();
    this.state = {
      username: "",
      pwd: "",
      isValidated: false
    };
  }

  handleRequest = e => {
    e.preventDefault();
    if (this.state.username === "" || this.state.pwd === "")
      alert("ONE OR MORE OF THE FIELDS ARE EMPTY!");
    else {
      (async () => {
        const res = await fetch("/login", {
          method: "POST",
          credentials: 'include',
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json; charset=utf-8"
          },
          body: JSON.stringify({
            username: this.state.username,
            password: this.state.pwd
          })
        });
        let content = await res.json();
        if (content.error === "Not verified") {
          this.props.history.push({
            pathname: "/verify"
          });
        } else if (content.status === "error") alert("Error: " + content.error);
        else {
            this.props.history.push({
            pathname: "/home"
            });
        }
        //   if(content.data === "pwd") alert("USER DOESN'T EXIST OR WRONG PASSWORD")
        //   else if(content1.data === "not"){ //user exists but isn't verifed.. redirect to verify page
        //       (async () => {const res = await fetch('http://localhost:4000/send', {
        //         method: 'POST',
        //         headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json; charset=utf-8'
        //         },
        //         body: JSON.stringify({
        //           username : this.state.username,
        //           email : content1.email
        //         })
        //       })
        //         let content = await res.json();
        //         console.log(content)
        //         if(content.status === "OK"){
        //   this.props.history.push({
        //     pathname: '/verify',
        //     state: {
        //       username: this.state.username,
        //       pwd: content1.pwd,
        //       email: content1.email,
        //       key: content.data
        //     }
        //           })
        //         }
        //     })()
        //   }
        //   else if(content1.status === "error") alert("SOMETHING WENT WRONG:(")
        //   else{
        // this.props.history.push({
        //   pathname: '/home',
        //       state: {
        //         username: this.state.username,
        //         pwd: this.state.pwd
        //       }
        //     })
        //   }
      })();
    }
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    return (
      <div className="loginContainer">
        <header>
          <link rel="stylesheet" href="style/styles.css" />
        </header>
        <h1>Login boi!!</h1>
        <form onSubmit={this.handleRequest}>
          <TextField
            type="text"
            name="username"
            label="Username"
            onChange={this.handleChange}
            margin="normal"
            variant="outlined"
            fullWidth
          />
          <br />
          <TextField
            type="password"
            name="pwd"
            label="Password"
            onChange={this.handleChange}
            margin="normal"
            variant="outlined"
            fullWidth
          />
          <br />
          <Button id="sub" type="submit">
            Submit
          </Button>
        </form>
      </div>
    );
  }
}

export default login;
