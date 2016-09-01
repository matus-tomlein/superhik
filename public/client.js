$(function() {
  var Item = React.createClass({
    render: function() {
      var figureStyle = { 'background-color': '#5764c6' };
      var initial = (this.props.i + 1) + '.';

      return (
        <tr>
          <td>
            <figure className="avatar avatar-md" data-initial={initial} style={figureStyle}></figure>
          </td>
          <td>
            <b>{this.props.user}</b>
          </td>
          <td>{this.props.count}</td>
          <td>{this.props.maximum} &permil;</td>
          <td>{this.props.average} &permil;</td>
          <td>
            <b>{this.props.value} &permil;</b>
          </td>
        </tr>
      );
    }
  });

  var List = React.createClass({
    render: function() {
      var items = this.props.items.sort(function (a, b) {
        return b.value - a.value;
      });
      items = items.map(function (item, i) {
        return (<Item {...item} i={i} />);
      });

      var style = { 'font-size': 'large' };

      return (
        <div className="container">
          <div className="card">
            <div className="card-body" style={style}>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>
                      <i className="fa fa-users" aria-hidden="true"></i>
                    </th>
                    <th>
                      Name
                    </th>
                    <th>Checks</th>
                    <th>Maximum</th>
                    <th>Average</th>
                    <th>Last test</th>
                  </tr>
                </thead>
                <tbody>
                  {items}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
  });

  var Container = React.createClass({
    getInitialState: function () {
      return { data: [] };
    },

    loadReadings: function () {
      $.ajax({
        url: '/read',
        dataType: 'json',
        cache: false,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },

    componentDidMount: function() {
      this.loadReadings();
      this.interval = setInterval(this.loadReadings, 1000);
    },

    render: function() {
      return (<List items={this.state.data} />);
    }
  });

  ReactDOM.render(
    (<Container />),
    document.getElementById('content')
  );
});
