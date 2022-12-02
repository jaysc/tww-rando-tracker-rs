/* istanbul ignore file */

import _ from "lodash";
import DatabaseHelper from "./database-helper";
import {
  EntrancePayload,
  IslandsForChartPayload,
  ItemPayload,
  LocationPayload,
  OnJoinedRoom, RsSettingsPayload, Settings,
} from "./database-logic";

export type IslandsForCharts = Record<
  string,
  Record<string, IslandsForChartsValue>
>;
export type IslandsForChartsValue = {
  island: string;
};

export type Entrances = Record<string, Record<string, EntrancesValue>>;
export type EntrancesValue = {
  entranceName: string;
};
export type Items = Record<string, Record<string, ItemsValue>>;
export type ItemsValue = {
  count: number;
};

export type LocationsChecked = Record<
  string,
  Record<string, LocationsCheckedValue>
>;
export type LocationsCheckedValue = {
  isChecked: boolean;
};

export type ItemsForLocations = Record<
  string,
  Record<string, ItemsForLocationsValue>
>;
export type ItemsForLocationsValue = {
  itemName: string;
};

export default class DatabaseState {
  entrances: Entrances;
  islandsForCharts: IslandsForCharts;
  items: Items;
  locationsChecked: LocationsChecked;
  itemsForLocations: ItemsForLocations;
  rsSettings: Settings

  constructor() {
    this.entrances = {};
    this.islandsForCharts = {};
    this.items = {};
    this.locationsChecked = {};
    this.itemsForLocations = {};
    this.rsSettings = { options: {}, certainSettings: {}};
  }

  public setState(data: OnJoinedRoom) {
    const newState = this._clone({
      entrances: true,
      islandsForCharts: true,
      items: true,
      itemsForLocations: true,
      locationsChecked: true,
      rsSettings: true,
    });

    newState.entrances = data.entrances;
    newState.islandsForCharts = data.islandsForCharts;
    newState.items = data.items;
    newState.locationsChecked = data.locationsChecked;
    newState.itemsForLocations = data.itemsForLocation;
    newState.rsSettings = data.rsSettings;

    return newState;
  }

  public setItem(userId: string, { itemName, count }: ItemPayload) {
    const newState = this._clone({
      items: true,
    });

    _.set(newState.items, [itemName, userId], { count });

    return newState;
  }

  public setLocation(
    userId: string,
    { generalLocation, detailedLocation, isChecked }: LocationPayload
  ) {
    const newState = this._clone({
      locationsChecked: true,
    });

    _.set(
      newState.locationsChecked,
      [
        DatabaseHelper.getLocationKey(generalLocation, detailedLocation),
        userId,
      ],
      { isChecked }
    );

    return newState;
  }

  public setItemsForLocations(
    userId: string,
    { itemName, generalLocation, detailedLocation }: ItemPayload
  ) {
    const newState = this._clone({
      itemsForLocations: true,
    });
    if (itemName) {
      _.set(
        newState.itemsForLocations,
        [
          DatabaseHelper.getLocationKey(generalLocation, detailedLocation),
          userId,
        ],
        { itemName }
      );
    } else {
      _.unset(newState.itemsForLocations, [
        DatabaseHelper.getLocationKey(generalLocation, detailedLocation),
        userId,
      ]);
    }

    return newState;
  }

  public setEntrance(
    userId: string,
    { entranceName, exitName }: EntrancePayload
  ) {
    const newState = this._clone({
      entrances: true,
    });

    if (entranceName) {
      _.set(newState.entrances, [exitName, userId], { entranceName });
    } else {
      _.unset(newState.entrances, [exitName, userId]);
    }

    return newState;
  }

  public setIslandsForCharts(
    userId: string,
    { island, chart }: IslandsForChartPayload
  ) {
    const newState = this._clone({
      islandsForCharts: true,
    });

    if (island) {
      _.set(newState.islandsForCharts, [chart, userId], { island });
    } else {
      _.unset(newState.islandsForCharts, [chart, userId]);
    }

    return newState;
  }

  public setRsSettings(userId: string, {settings}: RsSettingsPayload) {
    const newState = this._clone({
      rsSettings: true,
    });

    if (settings) {
      _.set(newState.rsSettings, ['rsSettings', userId], { data: JSON.stringify(settings) });
    } else {
      _.unset(newState.rsSettings, ['rsSettings', userId]);
    }

    return newState;
  }

  _clone({
    entrances: cloneEntrances,
    islandsForCharts: cloneIslandsForCharts,
    items: cloneItems,
    locationsChecked: cloneLocationsChecked,
    itemsForLocations: cloneItemsForLocations,
    rsSettings: cloneRsSettings,
  }: {
    entrances?: boolean;
    islandsForCharts?: boolean;
    items?: boolean;
    locationsChecked?: boolean;
    itemsForLocations?: boolean;
    rsSettings?: boolean,
  }) {
    const newState = new DatabaseState();

    newState.entrances = cloneEntrances
      ? _.clone(this.entrances)
      : this.entrances;
    newState.islandsForCharts = cloneIslandsForCharts
      ? _.clone(this.islandsForCharts)
      : this.islandsForCharts;
    newState.items = cloneItems ? _.clone(this.items) : this.items;
    newState.locationsChecked = cloneLocationsChecked
      ? _.cloneDeep(this.locationsChecked)
      : this.locationsChecked;
    newState.itemsForLocations = cloneItemsForLocations
      ? _.cloneDeep(this.itemsForLocations)
      : this.itemsForLocations;
    newState.rsSettings = cloneRsSettings
      ? _.cloneDeep(this.rsSettings)
      : this.rsSettings;

    return newState;
  }
}
