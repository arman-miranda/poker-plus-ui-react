import React from 'react';
import GameAcceptanceAlert from './GameAcceptanceAlert';

class Alert extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      alert_props: null
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
      } else {
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
