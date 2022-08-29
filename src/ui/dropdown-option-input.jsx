import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Permalink from '../services/permalink';

class DropdownOptionInput extends React.PureComponent {
  render() {
    const {
      labelText,
      optionList: propOptionList,
      optionName,
      optionValue,
      setOptionValue,
    } = this.props;

    const optionsList = propOptionList ?? _.get(Permalink.DROPDOWN_OPTIONS, optionName);
    const dropdownOptions = _.map(
      optionsList,
      (option) => (
        <option value={option} key={option}>
          {option}
        </option>
      ),
    );

    return (
      <>
        <td className="label-text">{labelText}</td>
        <td className="option-container">
          <div className="select-container">
            <select
              onChange={
                (event) => setOptionValue(
                  optionName,
                  _.get(optionsList, event.target.selectedIndex),
                )
              }
              value={optionValue}
            >
              {dropdownOptions}
            </select>
          </div>
        </td>
      </>
    );
  }
}

DropdownOptionInput.defaultProps = {
  optionList: null,
};

DropdownOptionInput.propTypes = {
  labelText: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  optionList: PropTypes.arrayOf(PropTypes.string),
  optionValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setOptionValue: PropTypes.func.isRequired,
};

export default DropdownOptionInput;
