import React from 'react';
import { Route, Redirect } from 'react-router-dom'

class Games extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameID: null,
      auth_token: this.props.location.token
    }
  }

  onFormSubmit(e) {
    e.preventDefault()
    this.setState({gameID: e.target[0].value})
  }

  render() {
    if(this.state.gameID) {
      return <Redirect to={`/games/${this.state.gameID}`} />
    }
    return(
      <div>
        <form onSubmit={this.onFormSubmit.bind(this)}>
          <h4>
            GameID:
            <input type="text" name="game_id" required={true}/><br/>
            <input type="submit" value="Join" />
          </h4>
        </form>
      </div>
    )
  }
}

export default Games;
