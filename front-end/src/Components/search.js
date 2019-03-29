import React, { Component } from "react"
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Post from './post'
let data = null

class Search extends Component {
  constructor() {
    super()
    this.state = {
      limit: 25,
      accepted: false,
      timestamp: false,
      show: false,
      search_str: ""
    };
  }

  handleRequest = (e) => {
    e.preventDefault()
    console.log(this.state.search_str);
    (async () => {
      const res = await fetch("/search", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          timestamp: this.state.timestamp,
          limit: this.state.limit,
          accepted: this.state.accepted,
          searchQuery: this.state.search_str //milestone 2
        })
      });
      let content = await res.json();
      console.log(content) 
      data = content.questions 
      this.setState({show: true})
    })();
  }

  showResults = (data) => { //display results
    let i = 0 //to eliminate dumb warnings lol
    return(
      data.map(item =>
      <Post
        key={++i}
        username={item.user.username}
        rep={item.user.reputation} 
        title={item.title}
        body={item.body} 
        views={item.views}
        time={item.time}
        tags={item.tags.map(tag => tag+" ")} 
        />
      )
    )
  }

  clearSearch = () => {this.setState({show: false})} //clear all posts from previous search 
  
  handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    const name = e.target.name
    this.setState({
      [name]: value
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <link rel="stylesheet" href="style/styles.css" />
        </header>
        <form onSubmit={this.handleRequest}>
            <TextField
                type="text"
                name="limit"
                label="Number of Posts to Show"
                onChange={this.handleInputChange}
                margin="normal"
                variant="outlined"
                fullWidth
            />
            <br />
            <TextField
                type="text"
                name="search_str"
                label="String to search post bodies or titles"
                onChange={this.handleInputChange}
                margin="normal"
                variant="outlined"
                fullWidth
            />
            <br />
            <label>
            By Time Stamp? :
            <input
                name="timestamp"
                type="checkbox"
                checked={this.state.timestamp}
                onChange={this.handleInputChange} />
            </label>
            <br />
            <label>
            By Accepted Answer? :
            <input
                name="accepted"
                type="checkbox"
                value={this.state.accepted}
                onChange={this.handleInputChange} />
            </label>
            <Button id="sub" type="submit">
            Submit
          </Button>
        </form>  
        <div>
          <Button id="clear" onClick={this.clearSearch}>
                Clear Search Results
          </Button> 
          {this.state.show ? this.showResults(data) : null }  
        </div>
      </div>
    )
  }
}

export default Search