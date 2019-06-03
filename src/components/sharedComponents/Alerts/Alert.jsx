import React from 'react';
import GameAcceptanceAlert from './GameAcceptanceAlert';
import GameStartAlert from './GameStartAlert';

class Alert extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      alert_props: null
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.alert_props.body !== prevProps.alert_props.body) {
      this.setState({
        alert_props: this.props.alert_props
      })
    }
  }

  componentDidMount() {
    this.setState({
      alert_props: this.props.alert_props
    })
  }

  renderAlert() {
    if(this.state.alert_props) {
      if (this.state.alert_props.alert_type === 'game_confirmation') {
        return (
          <GameAcceptanceAlert {...this.state}
            handleDismissAlert={this.props.handleDismissAlert.bind(this)} />
        )
      } else if (this.state.alert_props.alert_type === 'game_start') {
        return(
          <GameStartAlert {...this.state}
            handleDismissAlert={this.props.handleDismissAlert.bind(this)} />
        )
      }
      else {
        return this.state.alert_props.body
      }
    }
  }

  render() {
    return(
      <div>
        {this.renderAlert()}
      </div>
    )
  }
}

export default Alert;
