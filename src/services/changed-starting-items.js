import _ from 'lodash';

import LogicHelper from './logic-helper';
import Permalink from './permalink';
import Settings from './settings';

class ChangedStartingItems {
  static initialize() {
    const newChangedStartingItems = new ChangedStartingItems();

    newChangedStartingItems.changedItems = {};

    return newChangedStartingItems;
  }

  reset() {
    this.changedItems = {};
  }

  getItemCount(itemName) {
    return _.get(
      this.changedItems,
      itemName,
      LogicHelper.startingItemCount(itemName) ?? 0,
    );
  }

  incrementStartingItem(itemName) {
    const newChangedStartingItems = _.clone(this);
    const currentItemCount = this.getItemCount(itemName);

    let newItemCount = 1 + currentItemCount;
    const maxItemCount = LogicHelper.maxItemCount(itemName);
    if (newItemCount > maxItemCount) {
      newItemCount = 0;
    }
    if (newItemCount === LogicHelper.startingItemCount(itemName)) {
      newItemCount = null;
    }

    if (!_.isNil(newItemCount)) {
      _.set(newChangedStartingItems.changedItems, itemName, newItemCount);
    } else {
      _.unset(newChangedStartingItems.changedItems, itemName);
    }

    return newChangedStartingItems;
  }

  decrementStartingItem(itemName) {
    const newChangedStartingItems = _.clone(this);

    const currentItemCount = this.getItemCount(itemName);

    let newItemCount = currentItemCount - 1;
    if (newItemCount < 0) {
      newItemCount = LogicHelper.maxItemCount(itemName);
    }
    if (newItemCount === LogicHelper.startingItemCount(itemName)) {
      newItemCount = null;
    }

    if (!_.isNil(newItemCount)) {
      _.set(newChangedStartingItems.changedItems, itemName, newItemCount);
    } else {
      _.unset(newChangedStartingItems.changedItems, itemName);
    }

    return newChangedStartingItems;
  }

  applyChangedStartingItems(trackerState) {
    const newTrackerState = trackerState._clone({ items: true });

    if (this.changedItems) {
      const startingGear = Settings.getStartingGear();

      const newChangedStartingItems = _.pickBy(
        this.changedItems,
        (startingValue, itemName) => {
          const itemValue = trackerState.getItemValue(itemName);
          if (startingValue > itemValue) {
            newTrackerState.setItemValue(itemName, startingValue);
          }

          if (itemName === LogicHelper.ITEMS.TRIFORCE_SHARD) {
            Settings.setOptionValue(Permalink.OPTIONS.NUM_STARTING_TRIFORCE_SHARDS, startingValue);
            return false;
          }

          return true;
        },
      );

      const newStartingGear = _.merge(startingGear, newChangedStartingItems);
      Settings.updateStartingGear(newStartingGear);

      this.reset();
    }

    return {
      newChangedStartingItems: this,
      newTrackerState,
    };
  }
}

export default ChangedStartingItems;
