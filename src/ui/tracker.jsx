import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { Oval } from 'react-loader-spinner';
import { ToastContainer, toast } from 'react-toastify';

import LogicHelper from '../services/logic-helper';
import Permalink from '../services/permalink';
import Settings from '../services/settings';
import Spheres from '../services/spheres';
import TrackerController from '../services/tracker-controller';

import Buttons from './buttons';
import ColorPickerWindow from './color-picker-window';
import Images from './images';
import ItemsTable from './items-table';
import LocationsTable from './locations-table';
import SettingsWindow from './settings-window';
import SphereTracking from './sphere-tracking';
import Statistics from './statistics';
import Storage from './storage';

import 'react-toastify/dist/ReactToastify.css';

class Tracker extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      colorPickerOpen: false,
      colors: {
        extraLocationsBackground: null,
        itemsTableBackground: null,
        sphereTrackingBackground: null,
        statisticsBackground: null,
      },
      pendingChangedStartingItems: {},
      disableLogic: false,
      entrancesListOpen: false,
      isLoading: true,
      lastLocation: null,
      onlyProgressLocations: true,
      openedExit: null,
      openedLocation: null,
      openedLocationIsDungeon: null,
      settingsWindowOpen: false,
      startingItemSelection: false,
      trackSpheres: false,
    };

    this.initialize();

    this.clearOpenedMenus = this.clearOpenedMenus.bind(this);
    this.clearRaceModeBannedLocations = this.clearRaceModeBannedLocations.bind(this);
    this.decrementItem = this.decrementItem.bind(this);
    this.decrementStartingItem = this.decrementStartingItem.bind(this);
    this.incrementItem = this.incrementItem.bind(this);
    this.incrementStartingItem = this.incrementStartingItem.bind(this);
    this.refreshLogic = this.refreshLogic.bind(this);
    this.toggleColorPicker = this.toggleColorPicker.bind(this);
    this.toggleDisableLogic = this.toggleDisableLogic.bind(this);
    this.toggleEntrancesList = this.toggleEntrancesList.bind(this);
    this.toggleLocationChecked = this.toggleLocationChecked.bind(this);
    this.toggleOnlyProgressLocations = this.toggleOnlyProgressLocations.bind(this);
    this.toggleSettingsWindow = this.toggleSettingsWindow.bind(this);
    this.toggleStartingItemSelection = this.toggleStartingItemSelection.bind(this);
    this.toggleTrackSpheres = this.toggleTrackSpheres.bind(this);
    this.unsetExit = this.unsetExit.bind(this);
    this.unsetLastLocation = this.unsetLastLocation.bind(this);
    this.updateColors = this.updateColors.bind(this);
    this.updateEntranceForExit = this.updateEntranceForExit.bind(this);
    this.updateLogic = this.updateLogic.bind(this);
    this.updateOpenedExit = this.updateOpenedExit.bind(this);
    this.updateOpenedLocation = this.updateOpenedLocation.bind(this);
  }

  async initialize() {
    await Images.importImages();

    const preferences = Storage.loadPreferences();
    if (!_.isNil(preferences)) {
      this.updatePreferences(preferences);
    }

    const { loadProgress, permalink } = this.props;

    let initialData;

    if (loadProgress) {
      const saveData = Storage.loadFromStorage();

      if (!_.isNil(saveData)) {
        try {
          initialData = TrackerController.initializeFromSaveData(saveData);

          toast.success('Progress loaded!');
        } catch (err) {
          TrackerController.reset();
        }
      }

      if (_.isNil(initialData)) {
        toast.error('Could not load progress from save data!');
      }
    }

    if (_.isNil(initialData)) {
      try {
        const decodedPermalink = decodeURIComponent(permalink);

        initialData = await TrackerController.initializeFromPermalink(decodedPermalink);
      } catch (err) {
        toast.error('Tracker could not be initialized!');

        throw err;
      }
    }

    const {
      logic,
      saveData,
      spheres,
      trackerState,
    } = initialData;

    this.setState({
      isLoading: false,
      logic,
      saveData,
      spheres,
      trackerState,
    });
  }

  incrementItem(itemName) {
    const {
      lastLocation,
      trackerState,
    } = this.state;

    let newTrackerState = trackerState.incrementItem(itemName);

    if (!_.isNil(lastLocation)) {
      const {
        generalLocation,
        detailedLocation,
      } = lastLocation;

      newTrackerState = newTrackerState.setItemForLocation(
        itemName,
        generalLocation,
        detailedLocation,
      );
    }

    this.updateTrackerState(newTrackerState);
  }

  incrementStartingItem(itemName) {
    const { pendingChangedStartingItems } = this.state;
    // handle shards
    const currentItemCount = _.get(
      pendingChangedStartingItems,
      itemName,
      LogicHelper.startingItemCount(itemName) ?? 0,
    );

    let newItemCount = 1 + currentItemCount;
    const maxItemCount = LogicHelper.maxItemCount(itemName);
    if (newItemCount > maxItemCount) {
      newItemCount = 0;
    }
    if (newItemCount === LogicHelper.startingItemCount(itemName)) {
      newItemCount = null;
    }

    const newPendingChangedStartingItems = _.clone(pendingChangedStartingItems);
    if (!_.isNil(newItemCount)) {
      _.set(newPendingChangedStartingItems, itemName, newItemCount);
    } else {
      _.unset(newPendingChangedStartingItems, itemName);
    }

    this.setState({ pendingChangedStartingItems: newPendingChangedStartingItems });
  }

  decrementItem(itemName) {
    const { trackerState } = this.state;

    const newTrackerState = trackerState.decrementItem(itemName);

    this.updateTrackerState(newTrackerState);
  }

  decrementStartingItem(itemName) {
    const { pendingChangedStartingItems } = this.state;

    const currentItemCount = _.get(
      pendingChangedStartingItems,
      itemName,
      LogicHelper.startingItemCount(itemName) ?? 0,
    );

    let newItemCount = currentItemCount - 1;
    if (newItemCount < 0) {
      newItemCount = LogicHelper.maxItemCount(itemName);
    }
    if (newItemCount === LogicHelper.startingItemCount(itemName)) {
      newItemCount = null;
    }

    const newPendingChangedStartingItems = _.clone(pendingChangedStartingItems);
    if (!_.isNil(newItemCount)) {
      _.set(newPendingChangedStartingItems, itemName, newItemCount);
    } else {
      _.unset(newPendingChangedStartingItems, itemName);
    }

    this.setState({ pendingChangedStartingItems: newPendingChangedStartingItems });
  }

  toggleLocationChecked(generalLocation, detailedLocation) {
    const { trackerState } = this.state;

    let newTrackerState = trackerState.toggleLocationChecked(generalLocation, detailedLocation);

    if (newTrackerState.isLocationChecked(generalLocation, detailedLocation)) {
      this.setState({
        lastLocation: {
          generalLocation,
          detailedLocation,
        },
      });
    } else {
      this.setState({ lastLocation: null });

      newTrackerState = newTrackerState.unsetItemForLocation(generalLocation, detailedLocation);
    }

    this.updateTrackerState(newTrackerState);
  }

  clearRaceModeBannedLocations(dungeonName) {
    let { trackerState: newTrackerState } = this.state;

    const raceModeBannedLocations = LogicHelper.raceModeBannedLocations(dungeonName);

    _.forEach(raceModeBannedLocations, ({ generalLocation, detailedLocation }) => {
      if (!newTrackerState.isLocationChecked(generalLocation, detailedLocation)) {
        newTrackerState = newTrackerState.toggleLocationChecked(generalLocation, detailedLocation);
      }
    });

    this.updateTrackerState(newTrackerState);
  }

  updateTrackerState(newTrackerState) {
    const {
      logic,
      saveData,
      spheres,
      trackerState,
    } = TrackerController.refreshState(newTrackerState);

    Storage.saveToStorage(saveData);

    this.setState({
      logic,
      saveData,
      spheres,
      trackerState,
    });
  }

  toggleDisableLogic() {
    const { disableLogic } = this.state;

    this.updatePreferences({ disableLogic: !disableLogic });
  }

  clearOpenedMenus() {
    this.setState({
      entrancesListOpen: false,
      openedExit: null,
      openedLocation: null,
      openedLocationIsDungeon: null,
    });
  }

  updateOpenedExit(dungeonOrCaveName) {
    this.setState({
      entrancesListOpen: false,
      openedExit: dungeonOrCaveName,
      openedLocation: null,
      openedLocationIsDungeon: null,
    });
  }

  unsetExit(dungeonOrCaveName) {
    const { trackerState } = this.state;

    const entryName = LogicHelper.entryName(dungeonOrCaveName);
    const newTrackerState = trackerState
      .incrementItem(entryName)
      .unsetEntranceForExit(dungeonOrCaveName);

    this.updateTrackerState(newTrackerState);
  }

  updateEntranceForExit(exitName, entranceName) {
    const { trackerState } = this.state;

    const entryName = LogicHelper.entryName(exitName);
    const newTrackerState = trackerState
      .incrementItem(entryName)
      .setEntranceForExit(exitName, entranceName);

    this.updateTrackerState(newTrackerState);
    this.clearOpenedMenus();
  }

  updateOpenedLocation({ locationName, isDungeon }) {
    this.setState({
      entrancesListOpen: false,
      openedExit: null,
      openedLocation: locationName,
      openedLocationIsDungeon: isDungeon,
    });
  }

  toggleEntrancesList() {
    const { entrancesListOpen } = this.state;

    this.setState({
      entrancesListOpen: !entrancesListOpen,
      openedExit: null,
      openedLocation: null,
      openedLocationIsDungeon: null,
    });
  }

  toggleOnlyProgressLocations() {
    const { onlyProgressLocations } = this.state;

    this.updatePreferences({ onlyProgressLocations: !onlyProgressLocations });
  }

  toggleColorPicker() {
    const { colorPickerOpen } = this.state;

    this.setState({
      colorPickerOpen: !colorPickerOpen,
    });
  }

  toggleSettingsWindow() {
    const { settingsWindowOpen } = this.state;

    this.setState({
      settingsWindowOpen: !settingsWindowOpen,
    });
  }

  async toggleStartingItemSelection() {
    const { pendingChangedStartingItems, startingItemSelection, trackerState } = this.state;

    if (startingItemSelection && !_.isEmpty(pendingChangedStartingItems)) {
      const newTrackerState = trackerState._clone({ items: true });
      const startingGear = Settings.getStartingGear();

      const newChangedStartingItems = _.pickBy(
        pendingChangedStartingItems,
        (startingValue, itemName) => {
          const itemValue = trackerState.getItemValue(itemName);
          if (startingValue > itemValue) {
            newTrackerState.setItemValue(itemName, startingValue);
          }

          if (itemName === LogicHelper.ITEMS.TRIFORCE_SHARD) {
            Settings.setOptionsValue(Permalink.OPTIONS.NUM_STARTING_TRIFORCE_SHARDS, startingValue);
            return false;
          }

          return true;
        },
      );

      const newStartingGear = _.merge(startingGear, newChangedStartingItems);
      Settings.updateStartingGear(newStartingGear);

      this.setState({
        pendingChangedStartingItems: {},
        trackerState: newTrackerState,
      });

      await this.refreshLogic();
    }

    this.setState({
      startingItemSelection: !startingItemSelection,
    });
  }

  toggleTrackSpheres() {
    const { trackSpheres } = this.state;

    this.updatePreferences({ trackSpheres: !trackSpheres });
  }

  unsetLastLocation() {
    this.setState({ lastLocation: null });
  }

  updateColors(colorChanges) {
    this.updatePreferences({ colors: colorChanges });
  }

  async updateLogic({ newCertainSettings, newOptions }) {
    const { trackerState } = this.state;

    Settings.updateOptions(newOptions);
    Settings.updateCertainSettings(newCertainSettings);
    await TrackerController.refreshLogic();

    const { logic: newLogic } = TrackerController.refreshState(trackerState);

    this.setState({ logic: newLogic, spheres: new Spheres(trackerState) });
  }

  updatePreferences(preferenceChanges) {
    const {
      colors,
      disableLogic,
      onlyProgressLocations,
      trackSpheres,
    } = this.state;

    const existingPreferences = {
      colors,
      disableLogic,
      onlyProgressLocations,
      trackSpheres,
    };

    const newPreferences = _.merge({}, existingPreferences, preferenceChanges);

    this.setState(newPreferences);
    Storage.savePreferences(newPreferences);
  }

  render() {
    const {
      colorPickerOpen,
      colors,
      pendingChangedStartingItems,
      disableLogic,
      entrancesListOpen,
      isLoading,
      lastLocation,
      logic,
      onlyProgressLocations,
      openedExit,
      openedLocation,
      openedLocationIsDungeon,
      saveData,
      settingsWindowOpen,
      startingItemSelection,
      spheres,
      trackSpheres,
      trackerState,
    } = this.state;

    const {
      extraLocationsBackground,
      itemsTableBackground,
      sphereTrackingBackground,
      statisticsBackground,
    } = colors;

    let content;

    if (isLoading) {
      content = (
        <div className="loading-spinner">
          <Oval color="white" secondaryColor="gray" />
        </div>
      );
    } else {
      content = (
        <div className="tracker-container">
          <div className="tracker">
            <ItemsTable
              backgroundColor={itemsTableBackground}
              pendingChangedStartingItems={pendingChangedStartingItems}
              decrementItem={this.decrementItem}
              decrementStartingItem={this.decrementStartingItem}
              incrementItem={this.incrementItem}
              incrementStartingItem={this.incrementStartingItem}
              startingItemSelection={startingItemSelection}
              spheres={spheres}
              trackerState={trackerState}
              trackSpheres={trackSpheres}
            />
            <LocationsTable
              backgroundColor={extraLocationsBackground}
              clearOpenedMenus={this.clearOpenedMenus}
              clearRaceModeBannedLocations={this.clearRaceModeBannedLocations}
              decrementItem={this.decrementItem}
              disableLogic={disableLogic}
              entrancesListOpen={entrancesListOpen}
              incrementItem={this.incrementItem}
              logic={logic}
              onlyProgressLocations={onlyProgressLocations}
              openedExit={openedExit}
              openedLocation={openedLocation}
              openedLocationIsDungeon={openedLocationIsDungeon}
              spheres={spheres}
              toggleLocationChecked={this.toggleLocationChecked}
              trackerState={trackerState}
              trackSpheres={trackSpheres}
              unsetExit={this.unsetExit}
              updateEntranceForExit={this.updateEntranceForExit}
              updateOpenedExit={this.updateOpenedExit}
              updateOpenedLocation={this.updateOpenedLocation}
            />
            <Statistics
              backgroundColor={statisticsBackground}
              disableLogic={disableLogic}
              logic={logic}
              onlyProgressLocations={onlyProgressLocations}
            />
          </div>
          {trackSpheres && (
            <SphereTracking
              backgroundColor={sphereTrackingBackground}
              lastLocation={lastLocation}
              trackerState={trackerState}
              unsetLastLocation={this.unsetLastLocation}
            />
          )}
          {colorPickerOpen && (
            <ColorPickerWindow
              extraLocationsBackground={extraLocationsBackground}
              itemsTableBackground={itemsTableBackground}
              sphereTrackingBackground={sphereTrackingBackground}
              statisticsBackground={statisticsBackground}
              toggleColorPicker={this.toggleColorPicker}
              updateColors={this.updateColors}
            />
          )}
          {settingsWindowOpen && (
            <SettingsWindow
              toggleSettingsWindow={this.toggleSettingsWindow}
              updateLogic={this.updateLogic}
            />
          )}
          <Buttons
            colorPickerOpen={colorPickerOpen}
            disableLogic={disableLogic}
            entrancesListOpen={entrancesListOpen}
            onlyProgressLocations={onlyProgressLocations}
            saveData={saveData}
            settingsWindowOpen={settingsWindowOpen}
            startingItemSelection={startingItemSelection}
            trackSpheres={trackSpheres}
            toggleColorPicker={this.toggleColorPicker}
            toggleDisableLogic={this.toggleDisableLogic}
            toggleEntrancesList={this.toggleEntrancesList}
            toggleOnlyProgressLocations={this.toggleOnlyProgressLocations}
            toggleSettingsWindow={this.toggleSettingsWindow}
            toggleStartingItemSelection={this.toggleStartingItemSelection}
            toggleTrackSpheres={this.toggleTrackSpheres}
          />
        </div>
      );
    }

    return (
      <>
        {content}
        <ToastContainer />
      </>
    );
  }
}

Tracker.propTypes = {
  loadProgress: PropTypes.bool.isRequired,
  permalink: PropTypes.string.isRequired,
};

export default Tracker;
