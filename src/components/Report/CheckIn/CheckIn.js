import React, { Component } from "react";
import { httpClient } from "./../../../utils/HttpClient";
import { server } from "./../../../constants/index";
import * as moment from "moment";
import DatePicker from "react-datepicker";
import { Line, Bar, Pie } from "react-chartjs-2";
import Table from "./../../../utils/dynamicTable";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

function getDate(relative = 0) {
  let date = new Date();
  date.setDate(date.getDate() + relative);
  return date;
}

class CheckIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      startDate: getDate(-30),
      toDate: getDate(1),
      //for chart js
      reportType: "summary",
      chartType: "bar",
      labels: [],
      subLabelNames: [],
      DataForChartJs: {},
    };
  }

  componentDidMount() {
    this.getCheckIn();
  }

  loadingScreen() {
    if (this.state.data == null) {
      return (
        <div className="overlay">
          <i className="fas fa-3x fa-sync-alt fa-spin" />
          <div className="text-bold pt-2">Loading...</div>
        </div>
      );
    }
  }

  setReportType = async (reportType) => {
    await this.setState({ reportType: reportType });
    this.getCheckIn();
  };

  getCheckIn = async () => {
    let resultBackend = {};
    if (this.state.reportType === "bus") {
      resultBackend = await httpClient.post(server.BUS_CHECK_IN_REPORT_URL, {
        startDate: this.state.startDate,
        toDate: this.state.toDate,
      });
    } else if (this.state.reportType === "break") {
      resultBackend = await httpClient.post(server.BREAK_CHECK_IN_REPORT_URL, {
        startDate: this.state.startDate,
        toDate: this.state.toDate,
      });
    } else {
      resultBackend = await httpClient.post(server.CHECK_IN_REPORT_URL, {
        startDate: this.state.startDate,
        toDate: this.state.toDate,
      });
    }

    if (resultBackend !== null) {
      this.setState({ data: resultBackend });
      let myResult = resultBackend.data.result;

      //get all object key
      let subLabelNames = Object.getOwnPropertyNames(
        resultBackend.data.result[0]
      );
      this.setState({ subLabelNames: subLabelNames });

      let labels = [];
      let DataForChartJs = {};
      let objectvalue = [];

      //Set label date format
      myResult.map((item) => {
        labels.push(moment.utc(item[subLabelNames[0]]).format("DD-MMM-YYYY"));
      });
      this.setState({ labels });

      //convert data for chart js
      subLabelNames.map((subItem) => {
        myResult.map((item) => {
          objectvalue.push(item[subItem]);
        });
        Object.assign(DataForChartJs, { [subItem]: objectvalue });
        objectvalue = [];
      });
      this.setState({ DataForChartJs: DataForChartJs });

      // alert error msg
      if (resultBackend.data.result.length <= 0) {
        MySwal.fire({
          icon: "warning",
          title: "Oops... Data not found!",
          text:
            "Oops... Data not found! can not get data please contact web admin",
          footer: "<a href>Why do I have this issue?</a>",
        });
      }
    }
  };

  renderTable = () => {
    if (this.state.data != null) {
      return (
        <div
          className="card-body table-responsive p-0"
          style={{ maxHeight: 300 }}
        >
          <Table
            headers={this.state.subLabelNames}
            rows={this.state.data.data.result}
          />
        </div>
      );
    }
  };

  handleChangeStartDate = async (date) => {
    await this.setState({
      startDate: date,
    });
    this.getCheckIn();
  };

  handleChangeToDate = async (date) => {
    await this.setState({
      toDate: date,
    });
    this.getCheckIn();
  };

  render() {
    const startSubIndex = 1;
    function random_rgba() {
      var o = Math.round,
        r = Math.random,
        s = 255;
      return (
        "rgba(" +
        o(r() * s) +
        "," +
        o(r() * s) +
        "," +
        o(r() * s) +
        "," +
        "1" +
        ")"
      );
    }
    //alert(JSON.stringify(this.state.labels))
    let data = { labels: this.state.labels, datasets: [] };
    var colorSet = [];
    colorSet.push(
      "rgb(255,0,0,1)",
      "rgb(255,255,0,1)",
      "rgb(0,255,0,1)",
      "rgb(0,255,255,1)",
      "rgb(0,0,255,1)",
      "rgb(255,0,255,1)"
    );

    if (colorSet.length < this.state.subLabelNames.length - 1) {
      for (let i = colorSet.length; i < this.state.subLabelNames.length; i++) {
        colorSet.push(random_rgba());
      }
    }

    // chart Data
    for (
      let index = 0 + startSubIndex;
      index < this.state.subLabelNames.length;
      index++
    ) {
      if (this.state.chartType === "line") {
        data.datasets.push({
          label: this.state.subLabelNames[index],
          fill: true,

          lineTension: 0,
          backgroundColor: "rgba(255,255,255,0)",
          borderColor: colorSet[index - startSubIndex],
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(0,0,0,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(0,255,0,1)",
          pointHoverBorderColor: "rgba(0,0,0,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.state.DataForChartJs[this.state.subLabelNames[index]],
        });
      } else {
        data.datasets.push({
          label: this.state.subLabelNames[index],
          fill: true,
          lineTension: 0.1,
          backgroundColor: colorSet[index - startSubIndex],
          borderColor: colorSet[index - startSubIndex],
          borderCapStyle: "butt",
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: "miter",
          pointBorderColor: "rgba(0,0,0,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(0,255,0,1)",
          pointHoverBorderColor: "rgba(0,0,0,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.state.DataForChartJs[this.state.subLabelNames[index]],
        });
      }
    }

    // chart option
    const chartOptionBar = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            stacked: true,
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              },
            },
          },
        ],
        xAxes: [
          {
            stacked: true,
            ticks: {
              autoSkip: false,
              fontColor: "black",
            },
          },
        ],
      },
    };
    const chartOptionLine = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function (value, index, values) {
                return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              },
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              autoSkip: false,
              fontColor: "black",
            },
          },
        ],
      },
    };

    return (
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0 text-dark">Report check In</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-sm-12">
          <div className="card card-primary card-tabs">
            <div className="card-header p-0 pt-1"></div>
            <div className="btn-group btn-group-toggle" data-toggle="buttons">
              <label className="btn btn-primary active">
                <input
                  type="radio"
                  name="optionsSummary"
                  id="optionsSummary"
                  autoComplete="off"
                  defaultChecked
                  onClick={(e) => {
                    e.preventDefault();
                    this.setReportType("summary");
                  }}
                />
                Summary
              </label>
              <label className="btn btn-primary">
                <input
                  type="radio"
                  name="optionsBus"
                  id="optionsBus"
                  autoComplete="off"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setReportType("bus");
                  }}
                />
                Bus
              </label>
              <label className="btn btn-primary">
                <input
                  type="radio"
                  name="optionsBreak"
                  id="optionsBreak"
                  autoComplete="off"
                  onClick={(e) => {
                    e.preventDefault();
                    this.setReportType("break");
                  }}
                />
                Break
              </label>
            </div>

            <div className="card-body">
              <div
                className="tab-pane fade active show"
                id="custom-tabs-one-Summary"
                role="tabpanel"
                aria-labelledby="custom-tabs-one-Summary-tab"
              >
                <div className="overlay-wrapper">
                  {this.loadingScreen()}
                  {/* Chart */}
                  <section className="content-header">
                    <h1>
                      Chart
                      <small> Total check in</small>
                    </h1>
                    <hr></hr>
                    <div className="row">
                      <div className="col-md-6">
                        {/* input */}
                        <div className="form-group">
                          <label>Start date :</label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i
                                  className="far fa-calendar-alt"
                                  style={{ marginRight: 5 }}
                                />
                                <DatePicker
                                  selected={this.state.startDate}
                                  onSelect={this.handleChangeStartDate}
                                  onChange={this.handleChangeStartDate}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label>To date :</label>
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <span className="input-group-text">
                                <i
                                  className="far fa-calendar-alt"
                                  style={{ marginRight: 5 }}
                                />
                                <DatePicker
                                  selected={this.state.toDate}
                                  onSelect={this.handleChangeToDate}
                                  onChange={this.handleChangeToDate}
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* end setting date */}
                    <div class="btn-group">
                      <button
                        type="button"
                        class="btn btn-primary"
                        onClick={() => this.setState({ chartType: "line" })}
                      >
                        Line
                      </button>
                      <button
                        type="button"
                        class="btn btn-danger"
                        onClick={() => this.setState({ chartType: "bar" })}
                      >
                        Bar
                      </button>
                    </div>

                    <div style={{ height: 500 }}>
                      {this.state.chartType === "line" && (
                        <Line
                          data={data}
                          width={100}
                          height={50}
                          options={chartOptionLine}
                        />
                      )}
                      {this.state.chartType === "pie" && (
                        <Pie
                          data={data}
                          width={100}
                          height={50}
                          options={chartOptionBar}
                        />
                      )}
                      {this.state.chartType === "bar" && (
                        <Bar
                          data={data}
                          width={100}
                          height={50}
                          options={chartOptionBar}
                        />
                      )}
                    </div>
                  </section>
                </div>
                {/* Table */}
                <div className="card" style={{ margin: 0 }}>
                  {this.renderTable()}
                </div>
              </div>
            </div>
            {/* /.card */}
          </div>
        </div>
      </div>
    );
  }
}

export default CheckIn;
