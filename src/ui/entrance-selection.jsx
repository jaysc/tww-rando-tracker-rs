import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import LogicCalculation from '../services/logic-calculation';
import LogicHelper from '../services/logic-helper';
import TrackerState from '../services/tracker-state';

import Images from './images';
import KeyDownWrapper from './key-down-wrapper';
import RequirementsTooltip from './requirements-tooltip';
import Tooltip from './tooltip';

class EntranceSelection extends React.PureComponent {
  static NUM_ROWS = 13;

  exitTooltip(entranceName) {
    const { trackerState } = this.props;

    const exitName = trackerState.getExitForEntrance(entranceName);
    const shortExitName = LogicHelper.shortEntranceName(exitName);

    return (
      <div className="tooltip">
        <div className="tooltip-title">Entrance Leads To</div>
        <div>{shortExitName}</div>
      </div>
    );
  }

  requirementsTooltip(entranceName) {
    const { logic } = this.props;

    const requirements = logic.formattedRequirementsForEntrance(entranceName);

    return (
      <RequirementsTooltip requirements={requirements} />
    );
  }

  entrance(entranceInfo, numColumns) {
    if (_.isNil(entranceInfo)) {
      return null;
    }

    const {
      entrance,
      color,
    } = entranceInfo;

    const {
      disableLogic,
      openedExit,
      updateEntranceForExit,
    } = this.props;

    const shortEntranceName = LogicHelper.shortEntranceName(entrance);

    let fontSizeClassName = '';
    if (numColumns === 3) {
      fontSizeClassName = 'font-smallest';
    } else if (numColumns === 2) {
      fontSizeClassName = 'font-small';
    }

    const isEntranceChecked = color === LogicCalculation.LOCATION_COLORS.CHECKED_LOCATION;

    const notInteractiveClassName = isEntranceChecked ? 'detail-not-interactive' : '';

    const updateEntranceFunc = () => {
      if (!isEntranceChecked) {
        updateEntranceForExit(openedExit, entrance);
      }
    };

    const entranceElement = (
      <div
        className={`detail-span ${notInteractiveClassName} ${color} ${fontSizeClassName}`}
        onClick={updateEntranceFunc}
        onKeyDown={KeyDownWrapper.onSpaceKey(updateEntranceFunc)}
        role="button"
        tabIndex="0"
      >
        {shortEntranceName}
      </div>
    );

    let entranceContent;
    if (isEntranceChecked) {
      const exitTooltip = this.exitTooltip(entrance);

      entranceContent = (
        <Tooltip tooltipContent={exitTooltip}>
          {entranceElement}
        </Tooltip>
      );
    } else if (disableLogic) {
      entranceContent = entranceElement;
    } else {
      const requirementsTooltip = this.requirementsTooltip(LogicHelper.isAlternativeEntrance()
        ? openedExit : entrance);

      entranceContent = (
        <Tooltip tooltipContent={requirementsTooltip}>
          {entranceElement}
        </Tooltip>
      );
    }

    return (
      <td key={shortEntranceName}>
        {entranceContent}
      </td>
    );
  }

  render() {
    const {
      clearOpenedMenus,
      disableLogic,
      logic,
      openedExit,
    } = this.props;

    const entrances = logic.entrancesListForExit(openedExit, { disableLogic });

    const entranceChunks = _.chunk(entrances, EntranceSelection.NUM_ROWS);
    const arrangedEntrances = _.zip(...entranceChunks);
    const numColumns = _.size(entranceChunks);

    const entranceRows = _.map(arrangedEntrances, (locationsRow, index) => (
      <tr key={index}>
        {_.map(locationsRow, (entranceInfo) => this.entrance(entranceInfo, numColumns))}
      </tr>
    ));

    return (
      <div className="zoom-map">
        <div className="zoom-map-cover" />
        <div className="zoom-map-background">
          <img src={Images.IMAGES.EMPTY_BACKGROUND} alt="" />
        </div>
        <table className="header-table">
          <tbody>
            <tr>
              <td>
                <div className="detail-span detail-not-interactive">
                  Choose Entrance
                </div>
              </td>
              <td>
                <div
                  className="detail-span"
                  onClick={clearOpenedMenus}
                  onKeyDown={KeyDownWrapper.onSpaceKey(clearOpenedMenus)}
                  role="button"
                  tabIndex="0"
                >
                  X Close
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <table className="detailed-locations-table">
          <tbody>
            {entranceRows}
          </tbody>
        </table>
      </div>
    );
  }
}

EntranceSelection.propTypes = {
  clearOpenedMenus: PropTypes.func.isRequired,
  disableLogic: PropTypes.bool.isRequired,
  logic: PropTypes.instanceOf(LogicCalculation).isRequired,
  openedExit: PropTypes.string.isRequired,
  trackerState: PropTypes.instanceOf(TrackerState).isRequired,
  updateEntranceForExit: PropTypes.func.isRequired,
};

export default EntranceSelection;
