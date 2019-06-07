import React from "react"
import PropTypes from "prop-types"
import '../../stylesheets/modal.css';

export default class CommunityCardModal extends React.Component {
  onClose(e) {
    this.props.onClose && this.props.onClose(e)
  }
  render() {
    if (!this.props.displayModal) {
      return null;
    }
    return (
      <div className="modal" id="modal">
        <div className="content">
          {this.props.children}
        </div>
      </div>
    )
  }
}
CommunityCardModal.propTypes = {
  displayModal: PropTypes.bool.isRequired
}
