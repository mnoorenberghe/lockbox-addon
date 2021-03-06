/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Localized } from "fluent-react";
import PropTypes from "prop-types";
import React from "react";

import { classNames } from "../../../common";
import Button from "../../../widgets/button";
import Toolbar from "../../../widgets/toolbar";
import { EditItemFields } from "../../components/item-fields";
import DuplicateNotification from "../../components/duplicate-notification";

import styles from "./item-details.css";

// Note: EditItemDetails doesn't directly interact with items from the Lockwise
// datastore. For that, please consult <../containers/current-item.js>.

export default class EditItemDetails extends React.Component {
  static get propTypes() {
    return {
      ...EditItemFields.propTypes,
      itemId: PropTypes.string,
      error: PropTypes.object,
      onSave: PropTypes.func.isRequired,
      onCancel: PropTypes.func.isRequired,
      onDelete: PropTypes.func.isRequired,
      onReveal: PropTypes.func.isRequired,
    };
  }

  static get defaultProps() {
    return {
      itemId: null,
      error: null,
      fields: {
        origin: "",
        username: "",
        password: "",
      },
    };
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // If we've changed the item we're editing, reset the form fields to their
    // (new) initial state.
    if (nextProps.itemId !== prevState.itemId) {
      return {itemId: nextProps.itemId, ...nextProps.fields};
    }
    return null;
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
    this.props.onChange();
  }

  render() {
    const {fields: { title }, showPassword, onSave, onCancel, onDelete, onReveal, error} = this.props;
    const {itemId, ...saveState} = this.state;
    const newItem = itemId === null;
    const isDuplicate = error && !!~error.message.indexOf("This login already exists");
    const hostname = ((str) => {
      try {
        const url = new URL(str);
        return url.hostname;
      } catch (ex) {
        // ignore error; present the "raw" value
        return str;
      }
    })(this.state.origin);

    return (
      <form className={classNames([styles.itemDetails, styles.editing])}
            id={newItem ? "newItemForm" : "editItemForm"}
            onSubmit={(e) => {
              e.preventDefault();
              onSave(saveState);
            }}>
        {isDuplicate && <DuplicateNotification title={hostname} />}
        <header className="detail-title">
          {newItem ? (
            <Localized id={`item-details-heading-new`}>
              <h1>cREATe nEw eNTRy</h1>
            </Localized>
          ) : (
            <React.Fragment>
              <h1>{title}</h1>
              <Toolbar className={styles.buttons}>
                <Localized id="item-details-delete">
                  <Button id="deleteItemButton"
                    className={styles.deleteButton}
                    type="button"
                    theme={"ghost"} onClick={() => onDelete()}>dELETe</Button>
                </Localized>
              </Toolbar>
            </React.Fragment>
          )}
        </header>
        <EditItemFields fields={this.state}
                        showPassword={showPassword}
                        onReveal={onReveal}
                        onChange={(e) => this.handleChange(e)}/>
        <Toolbar className={styles.actions}>
          <Localized id={`item-details-save-${newItem ? "new" : "existing"}`}>
            <Button type="submit" theme="primary" size="wide">sAVe</Button>
          </Localized>
          <Localized id="item-details-cancel">
            <Button id="editItemCancelButton" type="button" onClick={() => onCancel()}>
              cANCEl
            </Button>
          </Localized>
        </Toolbar>
      </form>
    );
  }
}
