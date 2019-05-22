import React from 'react';

class PageNotFound extends React.Component {
  handleRedirection(e) {
    this.props.history.goBack()
  }

  render() {
    return (
      <div>
        <h1>Page not found</h1>
        <p>
          The page you are requesting doesn't seem to exists. 
          <a href="#" onClick={this.handleRedirection.bind(this)}>Go back.</a>
        </p>
      </div>
    )
  }
}

export default PageNotFound;
