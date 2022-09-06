import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Permalink from '../services/permalink';
import Settings from '../services/settings';

import DropdownOptionInput from './dropdown-option-input';
import KeyDownWrapper from './key-down-wrapper';
import OptionsTable from './options-table';
import ThreeStateToggleInput from './three-state-toggle-input';
import ToggleOptionInput from './toggle-option-input';

class SettingsWindow extends React.PureComponent {
  constructor(props) {
    super(props);

    const { certainSettings, options } = Settings.readAll();

    this.state = { certainSettings, options };

    this.applySettings = this.applySettings.bind(this);
    this.setCertainSettings = this.setCertainSettings.bind(this);
    this.setOptionValue = this.setOptionValue.bind(this);
  }

  getOptionValue(optionName) {
    const { options } = this.state;

    return _.get(options, optionName);
  }

  setOptionValue(optionName, newValue) {
    const { options } = this.state;

    const newOptions = _.cloneDeep(options);

    _.set(newOptions, optionName, newValue);

    this.setState({
      options: newOptions,
    });
  }

  setCertainSettings(optionName, newValue) {
    const { certainSettings } = this.state;

    const newCertainSettings = _.cloneDeep(certainSettings);

    const certainSettingsValue = newValue === Settings.SETTING_STATE.CERTAIN;

    if (newValue === Settings.SETTING_STATE.OFF) {
      this.setOptionValue(optionName, false);
    } else {
      this.setOptionValue(optionName, true);
    }

    _.set(newCertainSettings, optionName, certainSettingsValue);

    this.setState({
      certainSettings: newCertainSettings,
    });
  }

  progresionInput({ labelText, optionName }) {
    const { certainSettings } = this.state;

    const certainSettingsValue = _.get(certainSettings, optionName);
    const optionValue = this.getOptionValue(optionName);

    let optionValueDisplay;
    if (certainSettingsValue) {
      optionValueDisplay = Settings.SETTING_STATE.CERTAIN;
    } else {
      optionValueDisplay = optionValue ? Settings.SETTING_STATE.ON : Settings.SETTING_STATE.OFF;
    }

    return (
      <ThreeStateToggleInput
        key={optionName}
        labelText={labelText}
        optionName={optionName}
        optionValue={optionValueDisplay}
        setOptionValue={this.setCertainSettings}
      />
    );
  }

  toggleInput({ labelText, optionName }) {
    const optionValue = this.getOptionValue(optionName);

    return (
      <ToggleOptionInput
        key={optionName}
        labelText={labelText}
        optionName={optionName}
        optionValue={optionValue}
        setOptionValue={this.setOptionValue}
      />
    );
  }

  dropdownInput({ labelText, optionName }) {
    const optionValue = this.getOptionValue(optionName);

    return (
      <DropdownOptionInput
        key={optionName}
        labelText={labelText}
        optionName={optionName}
        optionValue={optionValue}
        setOptionValue={this.setOptionValue}
      />
    );
  }

  progressItemLocationsTable() {
    return (
      <OptionsTable
        title="Progress Item Locations"
        numColumns={3}
        options={[
          this.progresionInput({
            labelText: 'Dungeons',
            optionName: Permalink.OPTIONS.PROGRESSION_DUNGEONS,
          }),
          this.progresionInput({
            labelText: 'Tingle Chests',
            optionName: Permalink.OPTIONS.PROGRESSION_TINGLE_CHESTS,
          }),
          this.progresionInput({
            labelText: 'Mail',
            optionName: Permalink.OPTIONS.PROGRESSION_MAIL,
          }),
          this.progresionInput({
            labelText: 'Puzzle Secret Caves',
            optionName: Permalink.OPTIONS.PROGRESSION_PUZZLE_SECRET_CAVES,
          }),
          this.progresionInput({
            labelText: 'Combat Secret Caves',
            optionName: Permalink.OPTIONS.PROGRESSION_COMBAT_SECRET_CAVES,
          }),
          this.progresionInput({
            labelText: 'Savage Labyrinth',
            optionName: Permalink.OPTIONS.PROGRESSION_SAVAGE_LABYRINTH,
          }),
          this.progresionInput({
            labelText: 'Short Sidequests',
            optionName: Permalink.OPTIONS.PROGRESSION_SHORT_SIDEQUESTS,
          }),
          this.progresionInput({
            labelText: 'Long Sidequests',
            optionName: Permalink.OPTIONS.PROGRESSION_LONG_SIDEQUESTS,
          }),
          this.progresionInput({
            labelText: 'Spoils Trading',
            optionName: Permalink.OPTIONS.PROGRESSION_SPOILS_TRADING,
          }),
          this.progresionInput({
            labelText: 'Great Fairies',
            optionName: Permalink.OPTIONS.PROGRESSION_GREAT_FAIRIES,
          }),
          this.progresionInput({
            labelText: 'Free Gifts',
            optionName: Permalink.OPTIONS.PROGRESSION_FREE_GIFTS,
          }),
          this.progresionInput({
            labelText: 'Miscellaneous',
            optionName: Permalink.OPTIONS.PROGRESSION_MISC,
          }),
          this.progresionInput({
            labelText: 'Minigames',
            optionName: Permalink.OPTIONS.PROGRESSION_MINIGAMES,
          }),
          this.progresionInput({
            labelText: 'Battlesquid Minigame',
            optionName: Permalink.OPTIONS.PROGRESSION_BATTLESQUID,
          }),
          this.progresionInput({
            labelText: 'Expensive Purchases',
            optionName: Permalink.OPTIONS.PROGRESSION_EXPENSIVE_PURCHASES,
          }),
          this.progresionInput({
            labelText: 'Island Puzzles',
            optionName: Permalink.OPTIONS.PROGRESSION_ISLAND_PUZZLES,
          }),
          this.progresionInput({
            labelText: 'Lookout Platforms and Rafts',
            optionName: Permalink.OPTIONS.PROGRESSION_PLATFORMS_RAFTS,
          }),
          this.progresionInput({
            labelText: 'Submarines',
            optionName: Permalink.OPTIONS.PROGRESSION_SUBMARINES,
          }),
          this.progresionInput({
            labelText: 'Big Octos and Gunboats',
            optionName: Permalink.OPTIONS.PROGRESSION_BIG_OCTOS_GUNBOATS,
          }),
          this.progresionInput({
            labelText: 'Sunken Treasure (From Triforce Charts)',
            optionName: Permalink.OPTIONS.PROGRESSION_TRIFORCE_CHARTS,
          }),
          this.progresionInput({
            labelText: 'Sunken Treasure (From Treasure Charts)',
            optionName: Permalink.OPTIONS.PROGRESSION_TREASURE_CHARTS,
          }),
          this.progresionInput({
            labelText: 'Eye Reef Chests',
            optionName: Permalink.OPTIONS.PROGRESSION_EYE_REEF_CHESTS,
          }),
        ]}
      />
    );
  }

  additionalRandomizationOptionsTable() {
    return (
      <OptionsTable
        title="Additional Randomization Options"
        numColumns={2}
        options={[
          this.dropdownInput({
            labelText: 'Sword Mode',
            optionName: Permalink.OPTIONS.SWORD_MODE,
          }),
          this.toggleInput({
            labelText: 'Key-Lunacy',
            optionName: Permalink.OPTIONS.KEYLUNACY,
          }),
          this.toggleInput({
            labelText: 'Race Mode',
            optionName: Permalink.OPTIONS.RACE_MODE,
          }),
          this.dropdownInput({
            labelText: '',
            optionName: Permalink.OPTIONS.RANDOMIZE_ENTRANCES,
          }),
          this.toggleInput({
            labelText: 'Randomize Charts',
            optionName: Permalink.OPTIONS.RANDOMIZE_CHARTS,
          }),
        ]}
      />
    );
  }

  async applySettings() {
    const { certainSettings, options } = this.state;
    const { updateLogic, toggleSettingsWindow } = this.props;

    await updateLogic({ newCertainSettings: certainSettings, newOptions: options });
    toggleSettingsWindow();
  }

  render() {
    const {
      toggleSettingsWindow,
    } = this.props;

    return (
      <div className="settings-window">
        <div className="settings-top-row">
          <div className="settings-title">Settings</div>
          <div
            className="close-button"
            onClick={toggleSettingsWindow}
            onKeyDown={KeyDownWrapper.onSpaceKey(toggleSettingsWindow)}
            role="button"
            tabIndex="0"
          >
            X Close
          </div>
        </div>
        <div className="settings-wrapper">
          <div className="settings">
            {this.progressItemLocationsTable()}
            {this.additionalRandomizationOptionsTable()}
          </div>
          <div className="settings-apply">
            <button
              onClick={this.applySettings}
              type="button"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }
}

SettingsWindow.propTypes = {
  toggleSettingsWindow: PropTypes.func.isRequired,
  updateLogic: PropTypes.func.isRequired,
};

export default SettingsWindow;
