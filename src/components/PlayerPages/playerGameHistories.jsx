import React from 'react';
import '../../stylesheets/games_table.css';
import { Redirect } from 'react-router-dom';
import { getDataFromServer } from '../../shared/request_handlers';
import { Link } from 'react-router-dom';
import { parseCards } from '../../shared/card_generator.js';

class PlayerGameHistories extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      sessions: []
    }
  }

  componentDidMount() {
    this.fetchHistory()
  }

  fetchHistory() {
    let params = this.props.match.params
    var game = getDataFromServer(
      `http://localhost:3000/players/${params.player_id}/game_sessions/`
    ).then(results => {
      if (results !== null) {
        this.setState({ sessions: results })
        this.renderHistoryIndex()
      }
    })
  }

  renderHistoryIndex() {
    let sessions = this.state.sessions
    let playerGameHistoryTable = document.getElementById("playerGameHistoryTable")
    const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    sessions.map(session=>{
      var playerGameHistoryRow = document.createElement("tr")

      var PGHIdData = document.createElement("td")
      PGHIdData.setAttribute("class", "PGHIdData")
      PGHIdData.textContent = session.game.id
      playerGameHistoryRow.append(PGHIdData)

      var PGHGameNameData = document.createElement("td")
      PGHGameNameData.setAttribute("class", "PGHGameNameData")

      var sessionHistoryLink = document.createElement("a")
      sessionHistoryLink.setAttribute("href", `/games/${session.game.id}/game_sessions/${session.id}`)
      sessionHistoryLink.textContent = session.game.name

      PGHGameNameData.append(sessionHistoryLink)
      playerGameHistoryRow.append(PGHGameNameData)

      var created_at = new Date(session.game.created_at)
      function appendLeadingZeroes(n){
        if(n < 10){
          return "0" + n;
        }
        return n
      }
      let dateString = `${created_at.getDate()} ${months[created_at.getMonth()]} ${created_at.getFullYear()}`
      let timeString = `${appendLeadingZeroes(created_at.getHours())}:${appendLeadingZeroes(created_at.getMinutes())}`

      var PGHDateTimeData = document.createElement("td")
      PGHDateTimeData.setAttribute("class", "PGHDateTimeData")
      PGHDateTimeData.textContent = `${dateString} ${timeString}`
      playerGameHistoryRow.append(PGHDateTimeData)

      // var PGHCardData = document.createElement("td")
      // PGHCardData.setAttribute("class", "PGHCardData")
      // session.cards.map(card => {
      //   var PGHCardEntry = document.createElement("a")
      //   PGHCardEntry.setAttribute("class", "PGHCardEntry")
      //   PGHCardEntry.textContent = parseCards(card.number, card.suit)
      //   PGHCardData.append(PGHCardEntry)
      // })
      // playerGameHistoryRow.append(PGHCardData)

      playerGameHistoryTable.append(playerGameHistoryRow)
    })
  }

  render() {
    return(
      <div>
        <div>
          <strong>Sessions:</strong>
          <table>
            <thead>
              <tr>
                <th>Game ID</th>
                <th>Game Name</th>
                <th>Date</th>
                {/* <th>Cards</th> */}
              </tr>
            </thead>
            <tbody id="playerGameHistoryTable" />
          </table>
        </div>
        {/* <Link to={`/games/${this.props.match.params.game_id}/`}>Back to Game</Link> */}
      </div>
    )
  }
}

export default PlayerGameHistories;
