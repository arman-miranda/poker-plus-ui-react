import React from 'react';
import {
  requestPOSTTo,
  deleteDataFromServer } from '../../../shared/request_handlers';
import { Link } from 'react-router-dom';

class GameAcceptanceAlert extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      body: null,
      waitinglist: null
    }
  }

  componentDidMount() {
    this.setState({...this.props.alert_props})
  }

  handleGameJoin() {
    const { player_id, game_id, preferred_seat } = this.state.waitinglist

    requestPOSTTo(`games/${game_id}/player_games`, {
      player_id: player_id,
      game_id: game_id,
      preferred_seat: preferred_seat
    }).then(
      this.props.handleDismissAlert()
    )
  }

  handleDismiss() {
    const { id } = this.state.waitinglist

    deleteDataFromServer(`waitinglists/${id}`).then(
      this.props.handleDismissAlert()
    )
  }

  render() {
    const { body, waitinglist } = this.state
    return(
      <div>
        { body }
        <Link
          to={`/games/${waitinglist && waitinglist.game_id}`}
          onClick={this.handleGameJoin.bind(this, waitinglist)}>
          Join
        </Link>
        <a href='#'
          onClick={this.handleDismiss.bind(this)}>
          Deny
        </a>
      </div>
    )
  }
}

export default GameAcceptanceAlert;
