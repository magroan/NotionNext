import React from 'react';

/**
 * 下拉单选框
 */
class Select extends React.Component {
  handleChange = (event) => {
    const { onChange } = this.props;
    onChange(event.target.value);
  };

  render() {
    return (
      <div className='py-1 space-x-3'>
        <label className='text-gray-500'>{this.props.label}</label>
        <select
          value={this.props.value}
          onChange={this.handleChange}
          className='border p-1 rounded cursor-pointer'>
          {this.props.options?.map((o) =>
          <option key={o.value} value={o.value}>
              {o.text}
            </option>
          )}
        </select>
      </div>);

  }
}
Select.defaultProps = {
  label: '',
  value: '1',
  options: [
  { value: '1', text: "\u30AA\u30D7\u30B7\u30E7\u30F31" },
  { value: '2', text: "\u30AA\u30D7\u30B7\u30E7\u30F32" }]

};
export default Select;