import React from 'react';
import '../../stylesheets/games_table.css';
import { Redirect } from 'react-router-dom';
import { getDataFromServer } from '../../shared/request_handlers'
import { parseCards } from '../../shared/card_generator.js';

class GameHistory extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      community_card: {},
      game: {},
      id: {},
      rounds: {}
    }
  }

  componentDidMount() {
    this.fetchHistory()
  }

  fetchHistory() {
    let params = this.props.match.params
    var game = getDataFromServer(
      `http://localhost:3000/games/${params.game_id}/game_sessions/${params.id}`
    ).then(results => {
      if (results !== null) {
        this.setState({ ...results })
        this.renderCommunityCards()
        this.renderPlayerCards()
        this.renderActionLog()
      }
    })
  }

  renderCommunityCards(){
    let cards = this.state.community_card.cards
    let communityCardDiv = document.getElementById("communityCardDiv")

    let flopDiv = document.createElement("div")
    flopDiv.setAttribute("class", "flopDiv")
    flopDiv.textContent = "Flop:"
    communityCardDiv.append(flopDiv)

    let flop = cards.slice(0,3)

    flop.map(card=>{
      let flopCard = document.createElement("a")
      flopCard.setAttribute("class", "flopCard")
      flopCard.textContent = parseCards(card.number, card.suit)

      flopDiv.append(flopCard)
    })

    let turnDiv = document.createElement("div")
    turnDiv.setAttribute("class", "turnDiv")
    turnDiv.textContent = "Turn:"
    communityCardDiv.append(turnDiv)

    let turnCard = document.createElement("a")
    turnCard.setAttribute("class", "turnCard")
    turnCard.textContent = parseCards(cards[3].number, cards[3].suit)

    turnDiv.append(turnCard)

    let riverDiv = document.createElement("div")
    riverDiv.setAttribute("class", "riverDiv")
    riverDiv.textContent = "River:"
    communityCardDiv.append(riverDiv)

    let riverCard = document.createElement("a")
    riverCard.setAttribute("class", "riverCard")
    riverCard.textContent = parseCards(cards[4].number, cards[4].suit)

    riverDiv.append(riverCard)
  }

  renderPlayerCards(){
    let playerGames = this.state.game.player_games
    let playerCardsTable = document.getElementById("playerCardsTable")

    playerGames.map(playerGame=> {
      var playerGameRow = document.createElement("tr")

      var PGNameData = document.createElement("td")
      PGNameData.setAttribute("class", "PGNameData")
      PGNameData.textContent = playerGame.player.username
      playerGameRow.append(PGNameData)

      var PGSeatNumberData = document.createElement("td")
      PGSeatNumberData.setAttribute("class", "PGSeatNumberData")
      PGSeatNumberData.textContent = playerGame.seat_number
      playerGameRow.append(PGSeatNumberData)

      var PGCardsData = document.createElement("td")
      PGCardsData.setAttribute("class", "PGCardsData")
      playerGame.cards.map(card=> {
        var PGCardElement = document.createElement("a")
        PGCardElement.setAttribute("class", "PGCardElement")
        PGCardElement.textContent = parseCards(card.number, card.suit)

        PGCardsData.append(PGCardElement)
      })
      playerGameRow.append(PGCardsData)

      playerCardsTable.append(playerGameRow)
    })
  }

  renderActionLog(){
    let rounds = this.state.rounds
    let actionLogTable = document.getElementById("actionLogTable")

    rounds.map((round,i)=>{
      let roundNumber = i+1
      round.player_rounds.map(playerRound => {
        var actionLogRow = document.createElement("tr")

        var ALRoundNumberData = document.createElement("td")
        ALRoundNumberData.setAttribute("class", "ALRoundNumberData")
        ALRoundNumberData.textContent = roundNumber
        actionLogRow.append(ALRoundNumberData)

        var ALPlayerNameData = document.createElement("td")
        ALPlayerNameData.setAttribute("class", "ALPlayerNameData")
        ALPlayerNameData.textContent = playerRound.player.username
        actionLogRow.append(ALPlayerNameData)

        var ALActionData = document.createElement("td")
        var actionString = playerRound.action.replace("_", " ")
        actionString = actionString.charAt(0).toUpperCase() + actionString.slice(1)
        ALActionData.setAttribute("class", "ALActionData")
        ALActionData.textContent = actionString
        actionLogRow.append(ALActionData)

        actionLogTable.append(actionLogRow)
      })
    })
  }

  render() {
    return(
      <div>
        <div id="communityCardDiv">
          <h4>Community Cards:</h4>
        </div><br />

        <div id="playerCardsDiv">
          <h4>Player Cards:</h4>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Seat Number</th>
                <th>Cards</th>
              </tr>
            </thead>
            <tbody id="playerCardsTable" />
          </table>
        </div><br />

        <div id="playerCardsDiv">
          <h4>Action Log:</h4>
          <table>
            <thead>
              <tr>
                <th>Round</th>
                <th>Player</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="actionLogTable" />
          </table>
        </div><br />
      </div>
    )
  }
}

export default GameHistory;
