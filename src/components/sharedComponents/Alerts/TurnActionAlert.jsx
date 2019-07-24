import React from 'react';
import { requestPOSTTo } from '../../../shared/request_handlers';

class TurnActionAlert extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      call_check_action: "",
      raise_bet_action: ""
    }
  }

  componentDidMount() {
    this.props.handleAppAlertDismissal()
    this.determineCallCheckAction()
    this.determineRaiseBetAction()
  }

  handleSelectedAction(action) {
    const {
      game_id,
      currently_playing,
      joining_players,
      round_just_started
    } = this.props
    requestPOSTTo(`http://localhost:3000/games/${game_id}/player_rounds`, {
      player_action: action,
      currently_playing: currently_playing,
      joining_players: joining_players,
      round_just_started: round_just_started
    }).then(
      this.props.handleAlertDismissal()
    )
  }


  determineCallCheckAction() {
    const { bet_raised } = this.props

    if (bet_raised){
      this.setState({
        call_check_action: 'call'
      });
    } else {
      this.setState({
        call_check_action: 'check'
      });
    }
  }

  determineRaiseBetAction() {
    const { bet_raised } = this.props

    if (bet_raised){
      this.setState({
        raise_bet_action: 'raise'
      });
    } else {
      this.setState({
        raise_bet_action: 'bet'
      });
    }
  }

  render() {
    const { body } = this.props
    const { call_check_action } = this.state
    const { raise_bet_action } = this.state

    return(
      <div>
        { body }
        <a href='#' onClick={this.handleSelectedAction.bind(this, call_check_action)}>
          { call_check_action.charAt(0).toUpperCase() + call_check_action.slice(1) }
        </a>
        <a href='#' onClick={this.handleSelectedAction.bind(this, raise_bet_action)}>
          { raise_bet_action.charAt(0).toUpperCase() + raise_bet_action.slice(1) }
        </a>
        <a href='#' onClick={this.handleSelectedAction.bind(this, "fold")}>
          Fold
        </a>
      </div>
    )
  }
}

export default TurnActionAlert;
