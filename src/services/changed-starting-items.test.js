import ChangedStartingItems from './changed-starting-items';
import LogicHelper from './logic-helper';
import Permalink from './permalink';
import Settings from './settings';
import TrackerState from './tracker-state';

describe('ChangedStartingItems', () => {
  describe('initialize', () => {
    test('returns ChangedStartingItems', () => {
      const newChangedStartingItems = ChangedStartingItems.initialize();

      expect(newChangedStartingItems).toBeInstanceOf(ChangedStartingItems);
    });

    test('returns ChangedStartingItems with no changed items', () => {
      const newChangedStartingItems = ChangedStartingItems.initialize();

      expect(newChangedStartingItems.changedItems).toEqual({});
    });
  });

  describe('applyChangedStartingItems', () => {
    describe('when no items have been changed', () => {
      let changedStartingItems;
      let trackerState;
      beforeEach(() => {
        changedStartingItems = ChangedStartingItems.initialize();
        trackerState = TrackerState.default();
      });

      test('returns no modifications', () => {
        const {
          newChangedStartingItems,
          newTrackerState,
        } = changedStartingItems.applyChangedStartingItems(trackerState);

        expect(newChangedStartingItems).toEqual(changedStartingItems);
        expect(newTrackerState).toEqual(trackerState);
      });
    });

    describe('when items have been changed', () => {
      let changedStartingItems;
      let trackerState;
      beforeEach(() => {
        Settings.initializeRaw({
          options: {
            [Permalink.OPTIONS.NUM_STARTING_TRIFORCE_SHARDS]: 0,
            [Permalink.OPTIONS.SWORD_MODE]: Permalink.SWORD_MODE_OPTIONS.NO_STARTING_SWORD,
          },
          startingGear: {
            [LogicHelper.ITEMS.PROGRESSIVE_SWORD]: 0,
            [LogicHelper.ITEMS.PROGRESSIVE_SHIELD]: 1,
          },
        });

        LogicHelper.initialize();

        changedStartingItems = ChangedStartingItems.initialize();

        trackerState = TrackerState.default();
      });

      test('will update starting gear values', () => {
        expect(LogicHelper.startingItems).toEqual({
          "Boat's Sail": 1,
          'Progressive Shield': 1,
          'Progressive Sword': 0,
          'Triforce Shard': 0,
          'Wind Waker': 1,
          "Wind's Requiem": 1,
        });

        changedStartingItems.changedItems = {
          'Progressive Sword': 1,
          'Progressive Shield': 2,
          'Triforce Shard': 6,
        };

        const {
          newChangedStartingItems,
          newTrackerState,
        } = changedStartingItems.applyChangedStartingItems(trackerState);

        LogicHelper.reset();
        LogicHelper.initialize();

        expect(newChangedStartingItems.changedItems).toEqual({});
        expect(LogicHelper.startingItems).toEqual({
          "Boat's Sail": 1,
          'Progressive Shield': 2,
          'Progressive Sword': 1,
          'Triforce Shard': 6,
          'Wind Waker': 1,
          "Wind's Requiem": 1,
        });

        expect(newTrackerState.items["Boat's Sail"]).toBe(1);
        expect(newTrackerState.items['Progressive Shield']).toBe(2);
        expect(newTrackerState.items['Progressive Sword']).toBe(1);
        expect(newTrackerState.items['Triforce Shard']).toBe(6);
        expect(newTrackerState.items['Wind Waker']).toBe(1);
        expect(newTrackerState.items["Wind's Requiem"]).toBe(1);
      });

      test('changed items does not decrement existing item count', () => {
        changedStartingItems.changedItems = {
          "Boat's Sail": 0,
        };

        const {
          newTrackerState,
        } = changedStartingItems.applyChangedStartingItems(trackerState);

        LogicHelper.reset();
        LogicHelper.initialize();

        expect(LogicHelper.startingItems["Boat's Sail"]).toBe(0);

        expect(newTrackerState.items["Boat's Sail"]).toBe(1);
      });

      describe('changes sword mode option', () => {
        test('updates to start with sword', () => {
          changedStartingItems.changedItems = {
            'Progressive Sword': 1,
          };

          const {
            newTrackerState,
          } = changedStartingItems.applyChangedStartingItems(trackerState);

          LogicHelper.reset();
          LogicHelper.initialize();

          expect(LogicHelper.startingItems['Progressive Sword']).toBe(1);
          expect(newTrackerState.items['Progressive Sword']).toBe(1);
          expect(Settings.getOptionValue(Permalink.OPTIONS.SWORD_MODE))
            .toBe(Permalink.SWORD_MODE_OPTIONS.START_WITH_HEROS_SWORD);
        });

        test('updates to no starting sword', () => {
          // Needs to be examined more closely due to how the sword mode
          // option affects the starting item and tracker state value.
          Settings.initializeRaw({
            options: {
              [Permalink.OPTIONS.SWORD_MODE]: Permalink.SWORD_MODE_OPTIONS.START_WITH_HEROS_SWORD,
            },
            startingGear: {
              [LogicHelper.ITEMS.PROGRESSIVE_SWORD]: 1,
            },
          });

          LogicHelper.initialize();

          changedStartingItems.changedItems = {
            'Progressive Sword': 0,
          };

          const {
            newTrackerState,
          } = changedStartingItems.applyChangedStartingItems(trackerState);

          LogicHelper.reset();
          LogicHelper.initialize();

          expect(LogicHelper.startingItems['Progressive Sword']).toBe(1);
          expect(newTrackerState.items['Progressive Sword']).toBe(0);
          expect(Settings.getOptionValue(Permalink.OPTIONS.SWORD_MODE))
            .toBe(Permalink.SWORD_MODE_OPTIONS.NO_STARTING_SWORD);
        });
      });
    });
  });

  describe('incrementStartingItem', () => {
    let changedStartingItems;
    beforeEach(() => {
      changedStartingItems = ChangedStartingItems.initialize();

      changedStartingItems.changedItems = {
        'Progressive Sword': 1,
        'Progressive Shield': 2,
      };

      LogicHelper.startingItems = {
        'Progressive Shield': 1,
      };
    });

    test('increments when item has not been changed', () => {
      const newChangedStartingItems = changedStartingItems.incrementStartingItem('Bombs');

      expect(newChangedStartingItems.changedItems.Bombs).toBe(1);
    });
    test('increments when item already changed', () => {
      const newChangedStartingItems = changedStartingItems.incrementStartingItem('Progressive Sword');

      expect(newChangedStartingItems.changedItems['Progressive Sword']).toBe(2);
    });
    test('roll over value as item goes over max', () => {
      const newChangedStartingItems = changedStartingItems.incrementStartingItem('Progressive Shield');

      expect(newChangedStartingItems.changedItems['Progressive Shield']).toBe(0);
    });

    test('remove from changed items when equal to starting item count', () => {
      let newChangedStartingItems = changedStartingItems.incrementStartingItem('Progressive Shield');
      newChangedStartingItems = changedStartingItems.incrementStartingItem('Progressive Shield');

      expect(newChangedStartingItems.changedItems['Progressive Shield']).toBe(undefined);
    });
  });

  describe('decrementStartingItem', () => {
    let changedStartingItems;
    beforeEach(() => {
      changedStartingItems = ChangedStartingItems.initialize();

      changedStartingItems.changedItems = {
        'Progressive Sword': 2,
        'Progressive Shield': 2,
      };

      LogicHelper.startingItems = {
        'Progressive Shield': 1,
        'Triforce Shard': 6,
      };
    });

    test('decrements when item has not been changed', () => {
      const newChangedStartingItems = changedStartingItems.decrementStartingItem('Triforce Shard');

      expect(newChangedStartingItems.changedItems['Triforce Shard']).toBe(5);
    });
    test('decrements when item already changed', () => {
      const newChangedStartingItems = changedStartingItems.decrementStartingItem('Progressive Sword');

      expect(newChangedStartingItems.changedItems['Progressive Sword']).toBe(1);
    });
    test('roll over value as item goes over max', () => {
      const newChangedStartingItems = changedStartingItems.decrementStartingItem('Bombs');

      expect(newChangedStartingItems.changedItems.Bombs).toBe(1);
    });

    test('remove from changed items when equal to starting item count', () => {
      const newChangedStartingItems = changedStartingItems.decrementStartingItem('Progressive Shield');

      expect(newChangedStartingItems.changedItems['Progressive Shield']).toBe(undefined);
    });
  });

  describe('getItemCount', () => {
    let changedStartingItems;
    beforeEach(() => {
      changedStartingItems = ChangedStartingItems.initialize();

      changedStartingItems.changedItems = {
        'Progressive Sword': 1,
      };

      LogicHelper.startingItems = {
        'Progressive Shield': 2,
      };
    });

    test('returns item count when item has changed', () => {
      const result = changedStartingItems.getItemCount('Progressive Sword');

      expect(result).toBe(1);
    });

    test('returns starting item count when item not changed', () => {
      const result = changedStartingItems.getItemCount('Progressive Shield');

      expect(result).toBe(2);
    });
  });

  describe('reset', () => {
    let changedStartingItems;
    beforeEach(() => {
      changedStartingItems = ChangedStartingItems.initialize();

      changedStartingItems.changedItems = {
        'Progressive Sword': 1,
      };
    });

    test('set changed items back to empty', () => {
      changedStartingItems.reset();

      expect(changedStartingItems.changedItems).toEqual({});
    });
  });
});
