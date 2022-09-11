import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import LogicCalculation from '../services/logic-calculation';
import LogicHelper from '../services/logic-helper';
import TrackerState from '../services/tracker-state';

class MapInfo extends React.PureComponent {
  mapInfo() {
    const {
      disableLogic,
      logic,
      onlyProgressLocations,
      selectedExit,
      selectedItem,
      selectedLocation,
      selectedLocationIsDungeon,
      trackerState,
    } = this.props;

    if (_.isNil(selectedLocation)) {
      return null;
    }

    let entranceString;
    if (_.isNil(selectedExit) && _.isNil(selectedItem)) {
      const entranceInfo = [];
      const cavesForIsland = LogicHelper.cavesForIsland(selectedLocation);
      if (!_.isNil(cavesForIsland) && !_.isEmpty(cavesForIsland)) {
        cavesForIsland.forEach((cave) => {
          const entrance = _.findKey(
            trackerState.entrances,
            (exit) => exit === (cave),
          );

          if (entrance) {
            entranceInfo.push({
              entrance,
              exit: cave,
            });
          }
        });
      } else {
        const entrance = _.findKey(
          trackerState.entrances,
          (exit) => exit === (selectedLocation),
        );

        if (entrance) {
          entranceInfo.push({
            entrance,
            exit: selectedLocation,
          });
        }
      }

      if (!_.isNil(entranceInfo)) {
        entranceString = (
          <div className="map-item-info">
            { entranceInfo.map(({ entrance, exit }, index) => `${index > 0 ? '\n' : ''}${entrance} → ${exit}`)}
          </div>
        );
      }
    }

    const {
      numAvailable,
      numRemaining,
    } = logic.locationCounts(selectedLocation, {
      isDungeon: selectedLocationIsDungeon,
      onlyProgressLocations,
      disableLogic,
    });

    return (
      <div className="map-info-container">
        <div className="map-info">
          {selectedLocation}
        </div>
        {entranceString}
        <div className="chest-counts">
          <span className="chests-available">{numAvailable}</span>
          <span> Accessible, </span>
          <span className="chests-total">{numRemaining}</span>
          <span> Remaining</span>
        </div>
      </div>
    );
  }

  mapItemInfo() {
    const {
      selectedExit,
      selectedItem,
      trackerState,
    } = this.props;

    let itemInfoText;

    if (!_.isNil(selectedExit)) {
      const entranceForExit = trackerState.getEntranceForExit(selectedExit);

      if (!_.isNil(entranceForExit)) {
        const shortEntranceName = LogicHelper.shortEntranceName(entranceForExit);
        const shortExitName = LogicHelper.shortEntranceName(selectedExit);
        itemInfoText = `${shortExitName} → ${shortEntranceName}`;
      } else {
        itemInfoText = LogicHelper.entryName(selectedExit);
      }
    }

    if (!_.isNil(selectedItem)) {
      const itemCount = trackerState.getItemValue(selectedItem);
      itemInfoText = LogicHelper.prettyNameForItem(selectedItem, itemCount);
    }

    if (_.isNil(itemInfoText)) {
      return null;
    }

    return (
      <div className="map-item-info-container">
        <span className="map-item-info">{itemInfoText}</span>
      </div>
    );
  }

  render() {
    return (
      <>
        {this.mapInfo()}
        {this.mapItemInfo()}
      </>
    );
  }
}

MapInfo.defaultProps = {
  selectedExit: null,
  selectedItem: null,
  selectedLocation: null,
  selectedLocationIsDungeon: null,
};

MapInfo.propTypes = {
  disableLogic: PropTypes.bool.isRequired,
  logic: PropTypes.instanceOf(LogicCalculation).isRequired,
  onlyProgressLocations: PropTypes.bool.isRequired,
  selectedExit: PropTypes.string,
  selectedItem: PropTypes.string,
  selectedLocation: PropTypes.string,
  selectedLocationIsDungeon: PropTypes.bool,
  trackerState: PropTypes.instanceOf(TrackerState).isRequired,
};

export default MapInfo;
