import PropTypes from 'prop-types';
import React from 'react';

import DatabaseLogic from '../services/database-logic.ts';
import LogicHelper from '../services/logic-helper';

import Storage from './storage';

class Buttons extends React.PureComponent {
  constructor(props) {
    super(props);

    this.exportProgress = this.exportProgress.bind(this);
  }

  async exportProgress() {
    const { saveData } = this.props;

    await Storage.exportFile(saveData);
  }

  render() {
    const {
      chartListOpen,
      colorPickerOpen,
      databaseStats,
      disableLogic,
      entrancesListOpen,
      onlyProgressLocations,
      settingsWindowOpen,
      startingItemSelection,
      hideCoopItemLocations,
      hideCoopMiscItemLocations,
      trackSpheres,
      toggleChartList,
      toggleColorPicker,
      toggleCoopItemLocations,
      toggleCoopMiscItemLocations,
      toggleDisableLogic,
      toggleEntrancesList,
      toggleOnlyProgressLocations,
      toggleSettingsWindow,
      toggleStartingItemSelection,
      toggleTrackSpheres,
    } = this.props;

    const colorPickerText = colorPickerOpen
      ? 'Close Color Picker'
      : 'Open Color Picker';
    const entrancesListText = entrancesListOpen
      ? 'Close Entrances'
      : 'View Entrances';
    const chartListText = chartListOpen
      ? 'Close Chart List'
      : 'View Charts';
    const settingsWindowText = settingsWindowOpen
      ? 'Close Settings Window'
      : 'Open Settings Window';
    const startingItemSelectionText = startingItemSelection
      ? 'Disable Starting Item Selection'
      : 'Enable Starting Item Selection';
    const isRandomEntrances = LogicHelper.isRandomEntrances();

    return (
      <div className={`buttons ${startingItemSelection ? 'darken-background-z-index' : ''}`}>
        <button
          onClick={this.exportProgress}
          type="button"
        >
          Export Progress
        </button>
        <button
          onClick={toggleOnlyProgressLocations}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={!onlyProgressLocations} readOnly />
          Show Non-Progress Locations
        </button>
        {
          isRandomEntrances && (
            <button
              onClick={toggleEntrancesList}
              type="button"
            >
              {entrancesListText}
            </button>
          )
        }
        <button onClick={toggleChartList} type="button">
          {chartListText}
        </button>
        <br />
        <button
          onClick={toggleDisableLogic}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={!disableLogic} readOnly />
          Show Location Logic
        </button>
        <button
          disabled
          onClick={toggleTrackSpheres}
          type="button"
        >
          <input disabled type="checkbox" className="button-checkbox" checked={trackSpheres} readOnly />
          Track Spheres
        </button>
        <button
          onClick={toggleCoopItemLocations}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={hideCoopItemLocations} readOnly />
          Hide Coop Item Locations from Count
        </button>
        <button
          onClick={toggleCoopMiscItemLocations}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={!hideCoopMiscItemLocations} readOnly />
          Hide Coop Charts
        </button>
        <button
          onClick={toggleColorPicker}
          type="button"
        >
          {colorPickerText}
        </button>
        <button
          onClick={toggleSettingsWindow}
          disabled={!!databaseStats.rsSettingsInProgressUserId
            && databaseStats.rsSettingsInProgressUserId !== DatabaseLogic.userId}
          type="button"
        >
          {settingsWindowText}
        </button>
        <button
          onClick={toggleStartingItemSelection}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={startingItemSelection} readOnly />
          {startingItemSelectionText}
        </button>
      </div>
    );
  }
}

Buttons.propTypes = {
  chartListOpen: PropTypes.bool.isRequired,
  colorPickerOpen: PropTypes.bool.isRequired,
  databaseStats: PropTypes.exact({
    connected: PropTypes.bool.isRequired,
    rsSettingsInProgressUserId: PropTypes.string.isRequired,
    users: PropTypes.object.isRequired,
  }).isRequired,
  disableLogic: PropTypes.bool.isRequired,
  entrancesListOpen: PropTypes.bool.isRequired,
  onlyProgressLocations: PropTypes.bool.isRequired,
  saveData: PropTypes.string.isRequired,
  settingsWindowOpen: PropTypes.bool.isRequired,
  startingItemSelection: PropTypes.bool.isRequired,
  hideCoopItemLocations: PropTypes.bool.isRequired,
  hideCoopMiscItemLocations: PropTypes.bool.isRequired,
  trackSpheres: PropTypes.bool.isRequired,
  toggleChartList: PropTypes.func.isRequired,
  toggleColorPicker: PropTypes.func.isRequired,
  toggleCoopItemLocations: PropTypes.func.isRequired,
  toggleCoopMiscItemLocations: PropTypes.func.isRequired,
  toggleDisableLogic: PropTypes.func.isRequired,
  toggleEntrancesList: PropTypes.func.isRequired,
  toggleOnlyProgressLocations: PropTypes.func.isRequired,
  toggleSettingsWindow: PropTypes.func.isRequired,
  toggleStartingItemSelection: PropTypes.func.isRequired,
  toggleTrackSpheres: PropTypes.func.isRequired,
};

export default Buttons;
