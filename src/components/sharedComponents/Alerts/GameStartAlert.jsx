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
