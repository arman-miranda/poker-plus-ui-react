import React from 'react';
import {
  requestPUTTo
} from '../../../shared/request_handlers';

class GameStartAlert extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      body: null,
    }
  }

  componentDidMount() {
    this.setState({...this.props.alert_props})
  }

  handleJoining() {
    const {game_id, player_game_id} = this.state
    requestPUTTo(
      `http://localhost:3000/games/${game_id}/player_games/${player_game_id}`,
      { player_is_active: true }
    )
  }

  handlePassing() {
  }

  render() {
    const { body } = this.state
    return(
      <div>
        {body}
        <a href='#'
          onClick={this.handleJoining.bind(this)}>
          Join
        </a>
        <a href='#'
          onClick={this.handlePassing.bind(this)}>
          Pass
        </a>
      </div>
    );
  }
}

export default GameStartAlert;
