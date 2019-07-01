import React from 'react';
import '../../stylesheets/games_table.css';
import { getDataFromServer } from '../../shared/request_handlers'
import { parseCards } from '../../shared/card_generator.js';

class GameHistory extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      community_card: {},
      id: {},
      rounds: {},
      prevRoundNumber: 0
    }
  }

  componentDidMount() {
    this.fetchHistory()
  }

  fetchHistory() {
    let params = this.props.match.params
    getDataFromServer(
      `http://localhost:3000/games/${params.game_id}/game_sessions/${params.id}`
    ).then(results => {
      if (results !== null) {
        this.setState({ ...results })
        this.renderGameInfo()
        this.renderCommunityCards()
        this.renderPlayerCards()
        this.renderActionLog()
      }
    })
  }

  renderGameInfo() {
    const {game} = this.state
    const created_at = new Date(this.state.updated_at)
    const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let gameInfoDiv = document.getElementById("gameInfoDiv")

    let gameInfoIdNameLink = document.createElement("a")
    gameInfoIdNameLink.setAttribute("href", `/games/${game.id}`)

    let gameInfoIdNameDiv = document.createElement("div")
    let gameInfoIdNameLabel = document.createElement("strong")
    gameInfoIdNameLabel.textContent = `${game.id}: `
    gameInfoIdNameDiv.append(gameInfoIdNameLabel)

    let gameInfoIdNameData = document.createElement("strong")
    gameInfoIdNameData.textContent = game.name
    gameInfoIdNameDiv.append(gameInfoIdNameData)

    gameInfoIdNameLink.append(gameInfoIdNameDiv)
    gameInfoDiv.append(gameInfoIdNameLink)

    let gameInfoDealerDiv = document.createElement("div")
    let gameInfoDealerLabel = document.createElement("strong")
    gameInfoDealerLabel.textContent = "Dealer: "
    gameInfoDealerDiv.append(gameInfoDealerLabel)

    let gameInfoDealerInfo = document.createElement("strong")
    gameInfoDealerInfo.textContent = game.dealer.username
    gameInfoDealerDiv.append(gameInfoDealerInfo)

    gameInfoDiv.append(gameInfoDealerDiv)

    let gameInfoSessionDateDiv = document.createElement("div")
    let gameInfoSessionDateLabel = document.createElement("strong")
    gameInfoSessionDateLabel.textContent = "Session Date: "
    gameInfoSessionDateDiv.append(gameInfoSessionDateLabel)

    let gameInfoSessionDateInfo = document.createElement("span")

    function appendLeadingZeroes(n){
      if(n < 10){
        return "0" + n;
      }
      return n
    }
    let dateString = `${created_at.getDate()} ${months[created_at.getMonth()]} ${created_at.getFullYear()}`
    let timeString = `${appendLeadingZeroes(created_at.getHours())}:${appendLeadingZeroes(created_at.getMinutes())}`
    gameInfoSessionDateInfo.textContent = dateString + " " + timeString

    gameInfoSessionDateDiv.append(gameInfoSessionDateInfo)

    gameInfoDiv.append(gameInfoSessionDateDiv)
  }

  renderCommunityCards(){
    let cards = this.state.community_card.cards_history
    let communityCardDiv = document.getElementById("communityCardDiv")

    if (cards.length < 3) {
      let preFlopText = document.createElement("a")

      preFlopText.textContent = "(Game ended pre-flop)"
      communityCardDiv.append(preFlopText)
    }

    if (cards.length >= 3) {
      let flopDiv = document.createElement("div")
      flopDiv.setAttribute("class", "flopDiv")
      flopDiv.setAttribute("style","padding-left: 10px")
      flopDiv.textContent = "Flop:"
      communityCardDiv.append(flopDiv)

      let flop = cards.slice(0,3)

      flop.map(card=>{
        let flopCard = document.createElement("a")
        flopCard.setAttribute("class", "flopCard")
        flopCard.textContent = parseCards(card.number, card.suit)

        flopDiv.append(flopCard)
      })
    }

    if (cards.length >= 4) {
      let turnDiv = document.createElement("div")
      turnDiv.setAttribute("class", "turnDiv")
      turnDiv.setAttribute("style","padding-left: 10px")
      turnDiv.textContent = "Turn:"
      communityCardDiv.append(turnDiv)

      let turnCard = document.createElement("a")
      turnCard.setAttribute("class", "turnCard")
      turnCard.textContent = parseCards(cards[3].number, cards[3].suit)

      turnDiv.append(turnCard)
    }

    if (cards.length >= 5) {
      let riverDiv = document.createElement("div")
      riverDiv.setAttribute("class", "riverDiv")
      riverDiv.setAttribute("style","padding-left: 10px")
      riverDiv.textContent = "River:"
      communityCardDiv.append(riverDiv)

      let riverCard = document.createElement("a")
      riverCard.setAttribute("class", "riverCard")
      riverCard.textContent = parseCards(cards[4].number, cards[4].suit)

      riverDiv.append(riverCard)
    }
  }

  renderPlayerCards(){
    let {button} = this.state || null
    let playerSessions = this.state.player_sessions_history
    let playerCardsTable = document.getElementById("playerCardsTable")

    playerSessions.map(playerSession=> {
      var playerSessionRow = document.createElement("tr")

      var PSNameData = document.createElement("td")
      PSNameData.setAttribute("class", "PSNameData")
      PSNameData.textContent = playerSession.player.username
      playerSessionRow.append(PSNameData)

      var PSSeatNumberData = document.createElement("td")
      PSSeatNumberData.setAttribute("class", "PSSeatNumberData")
      PSSeatNumberData.textContent = playerSession.seat_number

      if (playerSession.seat_number === button) {
        var PSSeatNumberButtonData = document.createElement("a")
        PSSeatNumberButtonData.textContent = "(Button)"
        PSSeatNumberData.append(PSSeatNumberButtonData)
      }

      playerSessionRow.append(PSSeatNumberData)

      var PSCardsData = document.createElement("td")
      PSCardsData.setAttribute("class", "PSCardsData")
      playerSession.cards_history.map(card=> {
        var PSCardElement = document.createElement("a")
        PSCardElement.setAttribute("class", "PSCardElement")
        PSCardElement.textContent = parseCards(card.number, card.suit)

        PSCardsData.append(PSCardElement)
      })
      playerSessionRow.append(PSCardsData)
      playerCardsTable.append(playerSessionRow)
    })
  }

  renderActionLog(){
    let rounds = this.state.rounds
    let actionLogTable = document.getElementById("actionLogTable")
    const roundMarkers = ["Pre-flop","Flop","Turn","River"]

    rounds.map((round,i)=>{
      let roundNumber = i+1

      if (this.state.prevRoundNumber+1 === roundNumber) {
        var roundMarkerRow = document.createElement("tr")

        var roundMarkerActionSpan = document.createElement("strong")
        roundMarkerActionSpan.textContent = roundMarkers[roundNumber-1]

        roundMarkerRow.append(roundMarkerActionSpan)
        actionLogTable.append(roundMarkerRow)
      }

      round.player_rounds_history.map(playerRound => {
        var actionLogRow = document.createElement("tr")

        var ALPlayerNameData = document.createElement("td")
        ALPlayerNameData.setAttribute("class", "ALPlayerNameData")
        ALPlayerNameData.setAttribute("style", "padding-left:10px;")
        ALPlayerNameData.textContent = playerRound.player.username
        actionLogRow.append(ALPlayerNameData)

        var ALActionData = document.createElement("td")
        var actionString = playerRound.action.replace("_", " ")
        actionString = actionString.charAt(0).toUpperCase() + actionString.slice(1)
        ALActionData.setAttribute("class", "ALActionData")
        ALActionData.textContent = actionString
        actionLogRow.append(ALActionData)

        actionLogTable.append(actionLogRow)
        this.setState({ prevRoundNumber: roundNumber })
      })
    })
  }

  render() {
    return(
      <div>
        <div id="gameInfoDiv" /><br />

        <div id="communityCardDiv">
          <strong>Community Cards:</strong>
        </div><br />

        <div id="playerCardsDiv">
          <strong>Player Cards:</strong>
          <table style={{paddingLeft:'10px'}}>
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
          <strong>Action Log:</strong>
          <table style={{width:'30%', paddingLeft:'10px'}}>
            <tbody id="actionLogTable" />
          </table>
        </div><br />
      </div>
    )
  }
}

export default GameHistory;
