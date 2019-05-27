import React from 'react';
import { Route, Redirect } from 'react-router-dom'

class CardSelection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: this.props.match.params.id,
      suit1: "",
      value1: "",
      suit2: "",
      value2: ""
    }
  }

  onFormSubmit(e) {
    e.preventDefault()
    fetch(`http://localhost:3000/player_games/${this.state.id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        card1_suit: this.state.suit1,
        card1_number: this.state.value1,
        card2_suit: this.state.suit2,
        card2_number: this.state.value2
      })
    })
  }

  onSuitChange(e) {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  render() {
    return(
      <div>
        <form onSubmit={this.onFormSubmit.bind(this)}>
          Card 1:
          <select id="suit1" onChange={this.onSuitChange.bind(this)}>
            <option disabled selected value> -- </option>
            <option value="diamond">Diamonds</option>
            <option value="heart">Hearts</option>
            <option value="spade">Spades</option>
            <option value="club">Clubs</option>
          </select>
          <select id="value1" onChange={this.onSuitChange.bind(this)}>
            <option disabled selected value> -- </option>
            <option value="1">Ace</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option value="11">Jack</option>
            <option value="12">Queen</option>
            <option value="13">King</option>
          </select><br />

          Card 2:
          <select id="suit2" onChange={this.onSuitChange.bind(this)}>
            <option disabled selected value> -- </option>
            <option value="diamond">Diamonds</option>
            <option value="heart">Hearts</option>
            <option value="spade">Spades</option>
            <option value="club">Clubs</option>
          </select>
          <select id="value2" onChange={this.onSuitChange.bind(this)}>
            <option disabled selected value> -- </option>
            <option value="1">Ace</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option value="11">Jack</option>
            <option value="12">Queen</option>
            <option value="13">King</option>
          </select><br />

          <input type="submit" value="Submit"></input>
        </form>
      </div>
    )
  }
}

export default CardSelection;
