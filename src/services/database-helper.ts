import _ from "lodash";
import DatabaseLogic from "./database-logic";
import DatabaseState from "./database-state";
import Permalink from "./permalink";
import Settings from "./settings";

export default class DatabaseHelper {
  public static getLocationKey(generalLocation, detailedLocation) {
    return `${generalLocation}#${detailedLocation}`;
  }

  public static getMaxCount(databaseLogic: DatabaseLogic, databaseState: DatabaseState, itemName: string) {
    return _.reduce(
      _.get(databaseState.items, itemName),
      (acc, value, userId) => {
        if (databaseLogic.effectiveUserId !== userId) {
          return value.count > acc ? value.count : acc;
        }
        return acc;
      },
      0,
    );
  }

  public static getLocationsForItem(databaseLogic: DatabaseLogic, databaseState: DatabaseState, itemName: string) {
    return _.reduce(
      databaseState.itemsForLocations,
      (acc, data, location) => {
        const [generalLocation, detailedLocation] = location.split('#');
        _.forEach(data, (itemData: { itemName: string }, userId: string) => {
          if (databaseLogic.effectiveUserId !== userId) {
            const { itemName: databaseItemName } = itemData;
            if (itemName === databaseItemName) {
              acc.push({
                generalLocation,
                detailedLocation,
              });
            }
          }
        });

        return acc;
      },
      [],
    );
  }

  public static getItemForLocation = (databaseLogic: DatabaseLogic
    , databaseState: DatabaseState
    , generalLocation: string
    , detailedLocation: string
  ) => {
    return _.reduce(
      _.get(databaseState, ['itemsForLocations', DatabaseHelper.getLocationKey(generalLocation, detailedLocation)]),
      (acc, itemData, userId) => {
        if (databaseLogic.effectiveUserId !== userId) {
          const { itemName } = itemData;
          if (!acc.includes(itemName)) {
            acc.push(itemName);
          }
        }

        return acc;
      },
      [],
    );
  }

  public static hasCoopItem(databaseLogic: DatabaseLogic
    , databaseState: DatabaseState
    , generalLocation: string
    , detailedLocation: string
    , disableLogic: boolean): boolean {
    const isCharts = Settings.getOptionValue(Permalink.OPTIONS.PROGRESSION_TREASURE_CHARTS);
    const isTriforceCharts = Settings.getOptionValue(Permalink.OPTIONS.PROGRESSION_TRIFORCE_CHARTS)
    const isMisc = Settings.getOptionValue(Permalink.OPTIONS.PROGRESSION_MISC)

    const result = this.getItemForLocation(databaseLogic, databaseState, generalLocation, detailedLocation);
    
    if (!_.isNil(disableLogic)) {
      return result.length > 0;
    } else {
      return _.reduce(result, (acc, itemName) => {
        if (itemName.includes('Treasure Chart')) {
          if (isCharts){
            acc += 1;
          }
        } else if (itemName.includes('Triforce Chart')) {
          if (isTriforceCharts) {
            acc += 1;
          }
        } else if (itemName.includes('Tingle Statue')) {
          if (isMisc) {
            acc += 1;
          }
        } else {
          acc += 1;
        }

        return acc;
      }, 0) > 0;
    }
  }

  public static isLocationCoopChecked(databaseState: DatabaseState
    , generalLocation: string
    , detailedLocation: string
  ) {
    return _.some(_.get(databaseState
      , ['locationsChecked', DatabaseHelper.getLocationKey(generalLocation, detailedLocation)]), (locationData) => {
        return !!locationData.isChecked;
      })
  }
}