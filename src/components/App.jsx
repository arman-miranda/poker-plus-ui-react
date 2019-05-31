import React from 'react';
import {
  Route,
  Switch,
  BrowserRouter as Router
} from 'react-router-dom';
import { routes } from '../routes';
import { Redirect } from 'react-router-dom';
import PageNotFound from '../public/pageNotFound'
import Cable from 'actioncable'
import { deleteDataFromServer } from '../shared/request_handlers'
import Alert from './sharedComponents/Alerts/Alert'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentUser: JSON.parse(localStorage.getItem('currentUser')),
      alert_props: null
    }
  }

  componentDidMount() {
    if(this.state.currentUser) {
      this.createSocket()
    }
  }

  createSocket() {
    let cable = Cable.createConsumer('ws://localhost:3000/cable')
    this.app = cable.subscriptions.create({
      channel: 'UserChannel'
    }, {
      connected: () => {},
      received: (data) => {
        this.handleAlerts(data)
      },
    }
    )
  }

  handleUserLogout() {
    localStorage.currentUser = null;
    this.setState({
      currentUser: null
    })
    deleteDataFromServer('localhost:3000/logout')
  }

  handleUserLogin() {
    this.setState({
      currentUser: JSON.parse(localStorage.getItem('currentUser'))
    })
  }

  handleAlerts(alert_props) {
    this.setState({
      alert_props: alert_props
    })
  }

  handleDismissAlert() {
    this.setState({
      alert_props: null
    });
  }

  handleShowAlert() {
    return(
      <Alert
        alert_props={this.state.alert_props}
        handleDismissAlert={this.handleDismissAlert.bind(this)} />
    )
  }

  render() {
    return(
      <div>
        <Router>
          { this.state.alert_props &&
            <div className='notifications'>
              {this.handleShowAlert()}
            </div>
          }
          <Switch>
            { routes.map((route) => {
                return (
                  <Route
                    exact={route.exact}
                    key={route.path}
                    path={route.path}
                    render={props =>
                      this.state.currentUser || route.public ? (
                        <route.component
                          {...props}
                          currentUser={this.state.currentUser}
                          handleAlerts={this.handleAlerts.bind(this)}
                          handleDismissAlert={this.handleDismissAlert.bind(this)}
                          handleUserLogout={this.handleUserLogout.bind(this)}
                          handleUserLogin={this.handleUserLogin.bind(this)}
                        />
                      ) : (
                        <Redirect to={{pathname:'/login', state:{ from: props.location }}} />
                      )
                    }
                  />
                )
            })
            }
            <Route component={PageNotFound} />
          </Switch>
        </Router>
      </div>
    )
  }
}


export default App;
