import React from "react"
import PropTypes from "prop-types"
import '../../stylesheets/modal.css';

export default class Modal extends React.Component {
  onClose(e) {
    this.props.onClose && this.props.onClose(e)
  }
  render() {
    if (!this.props.displayModal) {
      return null;
    }
    return (
      <div className="modal" id="modal">
        <h3>New Game <input type="submit" value="Close" onClick={this.onClose.bind(this)} />
        </h3>
        <div className="content">{this.props.children}</div>
      </div>
    )
  }
}
Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  displayModal: PropTypes.bool.isRequired
}
