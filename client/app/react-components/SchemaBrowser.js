import React from 'react';
import PropTypes from 'prop-types';
import { PromiseState } from 'react-refetch';

import { Collapse } from 'react-bootstrap';
import List from 'react-virtualized/dist/commonjs/List';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';

function matchRe(pattern, specimen) {
  let re;
  try {
    re = new RegExp(pattern);
  } catch (p) {
    return specimen.includes(pattern);
  }
  return specimen.match(re);
}

export default class SchemaBrowser extends React.Component {
  static propTypes = {
    schema: PropTypes.instanceOf(PromiseState).isRequired,
    tableToggleString: PropTypes.string,
    onRefresh: PropTypes.func.isRequired,
    editorPaste: PropTypes.func.isRequired,
  };

  static defaultProps = {
    tableToggleString: null,
  }

  constructor(props) {
    super(props);
    const size = this.props.schema.fulfilled ? new Array(this.props.schema.value.schema.length) : [];
    this.state = { expanded: size, schemaFilter: '', filteredRows: null };
    this.list = React.createRef();
  }

  getTableSize = ({ index }) => (22 + (this.state.expanded[index] ?
    18 * this.props.schema.value.schema[index].columns.length : 0))

  itemSelected = (e) => {
    this.props.editorPaste(e.target.dataset.name);
  }

  showTable = (i) => {
    const expanded = this.state.expanded.slice();
    expanded[i] = !this.state.expanded[i];
    this.setState({ expanded });
    if (expanded[i]) {
      this.list.current.recomputeRowHeights(i);
    } else {
      this.list.current.forceUpdateGrid();
    }
  }


  schemaRows = ({ index, key, style }) => {
    const table = (this.state.filteredRows || this.props.schema.value.schema)[index];
    const showColumns = !!this.state.expanded[index];
    return (
      <div key={key} style={style}>
        <div className="table-name" onClick={() => this.showTable(index)}>
          <i className="fa fa-table" />
          <strong>
            <span title={table.name}>{table.name}</span>
            {table.length ? <span> ({table.length})</span> : ''}
          </strong>
          <i
            className="fa fa-angle-double-right copy-to-editor"
            aria-hidden="true"
            data-name={table.name}
            onClick={this.itemSelected}
          />
        </div>
        <Collapse in={showColumns} onExited={() => this.list.current.recomputeRowHeights(index)}>
          <div>
            {table.columns.map(column => (
              <div key={column} className="table-open">{column}
                <i
                  className="fa fa-angle-double-right copy-to-editor"
                  aria-hidden="true"
                  data-name={column}
                  onClick={this.itemSelected}
                />
              </div>
            ))}
          </div>
        </Collapse>
      </div>
    );
  }
  // if match(schemaFilter) && (!versionToggle || match(tableToggle))
  filterRows = (versionToggle, schemaFilter) => this.props.schema.value.schema.filter(t =>
    matchRe(schemaFilter, t.name) &&
    (!versionToggle || matchRe(this.props.tableToggleString, t.name)))


  toggleVersionedTables = () => this.setState({
    versionToggle: !this.state.versionToggle,
    filteredRows: this.filterRows(!this.state.versionToggle, this.state.schemaFilter),
  });

  updateSchemaFilter = e => this.setState({
    schemaFilter: e.target.value,
    filteredRows: this.filterRows(this.state.versionToggle, e.target.value),
  })

  render() {
    if (!this.props.schema.fulfilled) return null;
    return (
      <div className="schema-container">
        <div className="schema-control">
          <input
            type="text"
            placeholder="Search schema..."
            className="form-control"
            disabled={this.props.schema.value.schema.length === 0}
            onChange={this.updateSchemaFilter}
            value={this.state.schemaFilter}
          />
          <button
            className="btn btn-default"
            title="Refresh Schema"
            onClick={this.props.onRefresh}
          >
            <span className="zmdi zmdi-refresh" />
          </button>

          {this.props.tableToggleString ?
            <button
              className="btn btn-default"
              title="Toggle Versioned Tables"
              onClick={this.toggleVersionedTables}
            >
              <span className={`fa fa-toggle-${this.state.versionToggle ? 'on' : 'off'}`}>
                <input type="checkbox" id="versioned-tables-toggle" checked={this.state.versionToggle} hidden />
              </span>
            </button> : ''}
        </div>
        {/* Styles added to tweak AutoSizer/flexbox interaction */}
        <div style={{ flex: '1 1 auto', marginBottom: 10 }}>
          <AutoSizer>
            {({ width, height }) => (
              <List
                ref={this.list}
                rowCount={(this.state.filteredRows || this.props.schema.value.schema).length}
                rowHeight={this.getTableSize}
                width={width}
                height={height}
                rowRenderer={this.schemaRows}
                className="schema-browser"
              />)}
          </AutoSizer>
        </div>
      </div>
    );
  }
}