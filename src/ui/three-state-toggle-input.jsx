import PropTypes from 'prop-types';
import React from 'react';

import KeyDownWrapper from './key-down-wrapper';

class ThreeStateToggleInput extends React.PureComponent {
  constructor(props) {
    super(props);
    const { optionValue } = this.props;

    this.state = {
      value: optionValue,
    };

    this.decrement = this.decrement.bind(this);
    this.increment = this.increment.bind(this);
    this.handleNewValue = this.handleNewValue.bind(this);
  }

  handleNewValue(newValue) {
    const { optionName, setOptionValue } = this.props;

    setOptionValue(optionName, newValue);
  }

  decrement(event) {
    event.preventDefault();
    const { value } = this.state;

    let newValue = value - 1;
    if (newValue < 0) {
      newValue = 2;
    }

    if (newValue !== value) {
      this.setState({
        value: newValue,
      });
      this.handleNewValue(newValue);
    }
  }

  increment(event) {
    event.stopPropagation();
    const { value } = this.state;

    let newValue = value + 1;
    if (newValue > 2) {
      newValue = 0;
    }

    if (newValue !== value) {
      this.setState({
        value: newValue,
      });
      this.handleNewValue(newValue);
    }
  }

  render() {
    const { labelText } = this.props;
    const { value } = this.state;

    const toggleClassArray = ['react-toggle'];
    if (value === 1) {
      toggleClassArray.push('react-toggle--mid');
    } else if (value === 2) {
      toggleClassArray.push('react-toggle--checked');
    }

    return (
      <>
        <td className="label-text">{labelText}</td>
        <td className="option-container">
          <div
            className="three-state-toggle-input-container"
            onClick={this.increment}
            onContextMenu={this.decrement}
            onKeyDown={KeyDownWrapper.onSpaceKey(this.increment)}
            role="button"
            tabIndex="0"
          >
            <div className={toggleClassArray.join(' ')}>
              <div className="react-toggle-track">
                <div className="react-toggle-track-check" />
              </div>
              <div className="react-toggle-thumb" />
              <input type="radio" className="react-toggle-screenreader-only" checked={value === 0} readOnly />
              <input type="radio" className="react-toggle-screenreader-only" checked={value === 1} readOnly />
              <input type="radio" className="react-toggle-screenreader-only" checked={value === 2} readOnly />
            </div>
          </div>
        </td>
      </>
    );
  }
}

ThreeStateToggleInput.displayName = 'ThreeStateToggle';

ThreeStateToggleInput.defaultProps = {
  optionValue: 0,
};

ThreeStateToggleInput.propTypes = {
  labelText: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  setOptionValue: PropTypes.func.isRequired,
  optionValue: PropTypes.oneOfType(PropTypes.number),
};

export default ThreeStateToggleInput;
