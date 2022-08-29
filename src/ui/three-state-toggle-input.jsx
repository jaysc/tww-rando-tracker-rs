import PropTypes from 'prop-types';
import React from 'react';

import KeyDownWrapper from './key-down-wrapper';

class ThreeStateToggleInput extends React.PureComponent {
  constructor(props) {
    super(props);
    const { optionValue } = this.props;

    this.state = {
      hasFocus: false,
      value: optionValue,
    };

    this.decrement = this.decrement.bind(this);
    this.increment = this.increment.bind(this);
    this.handleNewValue = this.handleNewValue.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleFocus() {
    this.setState({ hasFocus: true });
  }

  handleBlur() {
    this.setState({ hasFocus: false });
  }

  handleNewValue(newValue) {
    const { optionName, setOptionValue } = this.props;

    setOptionValue(optionName, newValue);
  }

  decrement(event) {
    event.preventDefault();
    const { disabled } = this.props;

    if (disabled) {
      return;
    }

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
    const { disabled } = this.props;

    if (disabled) {
      return;
    }

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
    const { disabled, labelText } = this.props;
    const { hasFocus, value } = this.state;

    const toggleClassArray = ['react-toggle'];
    if (value === 1) {
      toggleClassArray.push('react-toggle--mid');
    } else if (value === 2) {
      toggleClassArray.push('react-toggle--checked');
    }

    if (hasFocus) {
      toggleClassArray.push('react-toggle--focus');
    }

    if (disabled) {
      toggleClassArray.push('react-toggle--disabled');
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
  disabled: false,
  optionValue: 0,
};

ThreeStateToggleInput.propTypes = {
  disabled: PropTypes.bool,
  labelText: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  setOptionValue: PropTypes.func.isRequired,
  optionValue: PropTypes.number,
};

export default ThreeStateToggleInput;
