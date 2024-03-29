import _ from 'lodash';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';

import HEADER_IMAGE from '../images/header.png';
import Permalink from '../services/permalink';

import DropdownOptionInput from './dropdown-option-input';
import OptionsTable from './options-table';
import Storage from './storage';
import ToggleOptionInput from './toggle-option-input';

import 'react-toastify/dist/ReactToastify.css';
import 'react-toggle/style.css';

export default class Launcher extends React.PureComponent {
  static openTrackerWindow(route) {
    const windowWidth = 1507;
    const windowHeight = 585;

    window.open(
      `#/tracker${route}`,
      '_blank',
      `width=${windowWidth},height=${windowHeight},titlebar=0,menubar=0,toolbar=0`,
    );
  }

  static introductionContainer() {
    return (
      <div className="introduction">
        <div className="content">
          <div className="title">
            TWW Randomizer Tracker Random Settings
          </div>
          <div className="text">
            This tracker is intended to be used for the
            {' '}
            <a href="https://github.com/tanjo3/wwrando/releases">Random Settings version of TWW Randomizer</a>
            .
            <br />
            The purpose of this tracker is enable you to alter settings while in progress.
            <br />
            You can find the standard version of the tracker
            {' '}
            <a href="https://www.wooferzfg.me/tww-rando-tracker/">here</a>
            .
          </div>
          <div className="heading">
            Changing Settings
          </div>
          <div className="text">
            The default permalink for this tracker will enable all the settings
            and no starting sword.
            <br />
            When you launch the tracker, you will see button at the bottom called &quot;
            <u>Open Settings Window</u>
            &quot;.
            <br />
            A pop-up will appear showing the same visuals as the launcher,
            allowing you change settings as required.
            <br />
            From there you can make adjustments to the settings, and press apply at the bottom.
            The tracker will reflect the changes you have made.
          </div>
          <div className="heading">
            Toggle States
          </div>
          <div className="text">
            The settings window within the tracker will now show a three-way toggle.
            <ul>
              <li>
                &quot;Off&quot; (Toggle to the left and red)
                - The setting is turned off.
              </li>
              <li>
                &quot;On&quot; (Toggle is at the centre and grey)
                - This setting is turned on.
              </li>
              <li>
                &quot;Certain&quot; (Toggle is to the right and blue)
                - Locations with these settings will additionally have an underline.
              </li>
            </ul>
          </div>
          <div className="heading">
            Additional Information
          </div>
          <div className="text">
            <ul>
              <li>
                <a href="https://github.com/tanjo3/wwrando/blob/random-settings/randomizers/random_settings.md">Random Settings Weights</a>
              </li>
              <li>
                <a href="https://docs.google.com/document/d/1ALwPFVHX5RUSGpVJQyi5lah20quBe98ZP5msayRpbjQ/view">Hints Documentation</a>
              </li>
              <li>
                <a href="https://drive.google.com/file/d/1mPhzoxL0wAPs7-a5Q1tM5AOx5jpb3lx9/view">Caves Interior Guide</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  constructor() {
    super();

    const permalink = Permalink.DEFAULT_PERMALINK;
    const options = Permalink.decode(permalink);

    this.state = {
      options,
      permalink,
      disableAll: true,
    };

    this.launchNewTracker = this.launchNewTracker.bind(this);
    this.loadFromFile = this.loadFromFile.bind(this);
    this.loadFromSave = this.loadFromSave.bind(this);
    this.setOptionValue = this.setOptionValue.bind(this);
    this.invertSettingsFunc = this.invertSettingsFunc.bind(this);
  }

  getOptionValue(optionName) {
    const { options } = this.state;

    return _.get(options, optionName);
  }

  setOptionValue(optionName, newValue) {
    const { options } = this.state;

    _.set(options, optionName, newValue);

    this.updateOptions(options);
  }

  loadPermalink(permalinkInput) {
    try {
      const options = Permalink.decode(permalinkInput);

      this.updateOptions(options);
    } catch (err) {
      toast.error('Invalid permalink!');
    }
  }

  updateOptions(options) {
    const permalink = Permalink.encode(options);

    this.setState({
      options,
      permalink,
    });
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

  invertSettingsFunc() {
    const { options, disableAll } = this.state;

    Object.keys(Permalink.OPTIONS).filter((key) => _.startsWith(key, 'PROGRESSION')).forEach((optionName) => {
      _.set(options, optionName.toLowerCase(), !disableAll);
    });

    this.updateOptions(options);

    this.setState(
      { disableAll: !disableAll },
    );
  }

  invertSettings() {
    const { disableAll } = this.state;

    return (
      <div className="launcher-button-container">
        <button
          className="launcher-button"
          type="button"
          onClick={this.invertSettingsFunc}
        >
          {`${disableAll ? 'Disable all' : 'Enable all'} tracker settings`}
        </button>
      </div>
    );
  }

  permalinkContainer() {
    const { permalink } = this.state;

    return (
      <div className="permalink-container">
        <div className="permalink-label">Permalink:</div>
        <div className="permalink-input">
          <input
            placeholder="Permalink"
            className="permalink"
            onChange={(event) => this.loadPermalink(event.target.value)}
            value={permalink}
          />
        </div>
      </div>
    );
  }

  progressItemLocationsTable() {
    return (
      <OptionsTable
        title="Progress Item Locations"
        numColumns={3}
        options={[
          this.toggleInput({
            labelText: 'Dungeons',
            optionName: Permalink.OPTIONS.PROGRESSION_DUNGEONS,
          }),
          this.toggleInput({
            labelText: 'Tingle Chests',
            optionName: Permalink.OPTIONS.PROGRESSION_TINGLE_CHESTS,
          }),
          this.toggleInput({
            labelText: 'Mail',
            optionName: Permalink.OPTIONS.PROGRESSION_MAIL,
          }),
          this.toggleInput({
            labelText: 'Puzzle Secret Caves',
            optionName: Permalink.OPTIONS.PROGRESSION_PUZZLE_SECRET_CAVES,
          }),
          this.toggleInput({
            labelText: 'Combat Secret Caves',
            optionName: Permalink.OPTIONS.PROGRESSION_COMBAT_SECRET_CAVES,
          }),
          this.toggleInput({
            labelText: 'Savage Labyrinth',
            optionName: Permalink.OPTIONS.PROGRESSION_SAVAGE_LABYRINTH,
          }),
          this.toggleInput({
            labelText: 'Short Sidequests',
            optionName: Permalink.OPTIONS.PROGRESSION_SHORT_SIDEQUESTS,
          }),
          this.toggleInput({
            labelText: 'Long Sidequests',
            optionName: Permalink.OPTIONS.PROGRESSION_LONG_SIDEQUESTS,
          }),
          this.toggleInput({
            labelText: 'Spoils Trading',
            optionName: Permalink.OPTIONS.PROGRESSION_SPOILS_TRADING,
          }),
          this.toggleInput({
            labelText: 'Great Fairies',
            optionName: Permalink.OPTIONS.PROGRESSION_GREAT_FAIRIES,
          }),
          this.toggleInput({
            labelText: 'Free Gifts',
            optionName: Permalink.OPTIONS.PROGRESSION_FREE_GIFTS,
          }),
          this.toggleInput({
            labelText: 'Miscellaneous',
            optionName: Permalink.OPTIONS.PROGRESSION_MISC,
          }),
          this.toggleInput({
            labelText: 'Minigames',
            optionName: Permalink.OPTIONS.PROGRESSION_MINIGAMES,
          }),
          this.toggleInput({
            labelText: 'Battlesquid Minigame',
            optionName: Permalink.OPTIONS.PROGRESSION_BATTLESQUID,
          }),
          this.toggleInput({
            labelText: 'Expensive Purchases',
            optionName: Permalink.OPTIONS.PROGRESSION_EXPENSIVE_PURCHASES,
          }),
          this.toggleInput({
            labelText: 'Island Puzzles',
            optionName: Permalink.OPTIONS.PROGRESSION_ISLAND_PUZZLES,
          }),
          this.toggleInput({
            labelText: 'Lookout Platforms and Rafts',
            optionName: Permalink.OPTIONS.PROGRESSION_PLATFORMS_RAFTS,
          }),
          this.toggleInput({
            labelText: 'Submarines',
            optionName: Permalink.OPTIONS.PROGRESSION_SUBMARINES,
          }),
          this.toggleInput({
            labelText: 'Big Octos and Gunboats',
            optionName: Permalink.OPTIONS.PROGRESSION_BIG_OCTOS_GUNBOATS,
          }),
          this.toggleInput({
            labelText: 'Sunken Treasure (From Triforce Charts)',
            optionName: Permalink.OPTIONS.PROGRESSION_TRIFORCE_CHARTS,
          }),
          this.toggleInput({
            labelText: 'Sunken Treasure (From Treasure Charts)',
            optionName: Permalink.OPTIONS.PROGRESSION_TREASURE_CHARTS,
          }),
          this.toggleInput({
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
          this.dropdownInput({
            labelText: 'Triforce Shards to Start With',
            optionName: Permalink.OPTIONS.NUM_STARTING_TRIFORCE_SHARDS,
          }),
          this.toggleInput({
            labelText: 'Race Mode',
            optionName: Permalink.OPTIONS.RACE_MODE,
          }),
          this.dropdownInput({
            labelText: 'Randomize Entrances',
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

  convenienceTweaksTable() {
    return (
      <OptionsTable
        title="Convenience Tweaks"
        numColumns={2}
        options={[
          this.toggleInput({
            labelText: 'Skip Boss Rematches',
            optionName: Permalink.OPTIONS.SKIP_REMATCH_BOSSES,
          }),
        ]}
      />
    );
  }

  launchNewTracker() {
    const encodedPermalink = this.encodedPermalink();

    Launcher.openTrackerWindow(`/new/${encodedPermalink}`);
  }

  loadFromSave() {
    const encodedPermalink = this.encodedPermalink();

    Launcher.openTrackerWindow(`/load/${encodedPermalink}`);
  }

  encodedPermalink() {
    const { permalink } = this.state;

    return encodeURIComponent(permalink);
  }

  async loadFromFile() {
    await Storage.loadFileAndStore();

    this.loadFromSave();
  }

  launchButtonContainer() {
    return (
      <div className="launcher-button-container">
        <button
          className="launcher-button"
          type="button"
          onClick={this.launchNewTracker}
        >
          Launch New Tracker
        </button>
        <button
          className="launcher-button"
          type="button"
          onClick={this.loadFromSave}
        >
          Load From Autosave
        </button>
        <button
          className="launcher-button"
          type="button"
          onClick={this.loadFromFile}
        >
          Load From File
        </button>
      </div>
    );
  }

  render() {
    return (
      <div className="full-container">
        <div className="launcher-container">
          <div className="header">
            <img
              src={HEADER_IMAGE}
              alt="The Legend of Zelda: The Wind Waker Randomizer Tracker"
              draggable={false}
            />
          </div>
          <div className="settings">
            {Launcher.introductionContainer()}
            {this.permalinkContainer()}
            {this.progressItemLocationsTable()}
            {this.additionalRandomizationOptionsTable()}
            {this.convenienceTweaksTable()}
            {this.invertSettings()}
            {this.launchButtonContainer()}
          </div>
          <div className="attribution">
            <span>Maintained by Jaysc/Colfra • Check out the </span>
            <a href="https://discord.gg/HQP3cAF">TWW Randomizer Racing discord</a>
          </div>
          <div className="attribution">
            <span>Based on code by wooferzfg • Source Code on </span>
            <a href="https://github.com/wooferzfg/tww-rando-tracker">GitHub</a>
            <span> • Original Tracker by BigDunka</span>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }
}
