/*!

=========================================================
* Black Dashboard React v1.2.2
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState } from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar, Pie } from "react-chartjs-2";

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
  Badge,
} from "reactstrap";

function Visitors() {
  const [timeRange, setTimeRange] = useState("daily");
  const [visitorData] = useState({
    daily: {
      pageViews: 2547,
      uniqueVisitors: 1283,
      avgTimeOnSite: "3:45",
      bounceRate: "35.8%",
      topPages: [
        { page: "/products", views: 856, avgTime: "2:30" },
        { page: "/categories", views: 654, avgTime: "1:45" },
        { page: "/cart", views: 432, avgTime: "3:15" },
      ],
      visitorsByTime: {
        labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
        datasets: [
          {
            label: "Visitors",
            data: [150, 100, 450, 600, 500, 300],
            borderColor: "#1f8ef1",
            fill: true,
            backgroundColor: "rgba(31, 142, 241, 0.2)",
          },
        ],
      },
      deviceDistribution: {
        labels: ["Desktop", "Mobile", "Tablet"],
        datasets: [
          {
            data: [55, 35, 10],
            backgroundColor: ["#1f8ef1", "#00f2c3", "#fd5d93"],
          },
        ],
      },
      recentVisitors: [
        {
          id: 1,
          ip: "192.168.1.1",
          location: "New York, USA",
          device: "Desktop - Chrome",
          time: "2024-03-09 15:30",
          page: "/products",
        },
        {
          id: 2,
          ip: "192.168.1.2",
          location: "London, UK",
          device: "Mobile - Safari",
          time: "2024-03-09 15:25",
          page: "/cart",
        },
        {
          id: 3,
          ip: "192.168.1.3",
          location: "Paris, France",
          device: "Tablet - Firefox",
          time: "2024-03-09 15:20",
          page: "/categories",
        },
      ],
    },
    weekly: {
      pageViews: 15280,
      uniqueVisitors: 7645,
      avgTimeOnSite: "4:15",
      bounceRate: "32.5%",
      visitorsByTime: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Visitors",
            data: [1200, 1400, 1300, 1500, 1600, 1200, 1100],
            borderColor: "#1f8ef1",
            fill: true,
            backgroundColor: "rgba(31, 142, 241, 0.2)",
          },
        ],
      },
    },
    monthly: {
      pageViews: 65420,
      uniqueVisitors: 32710,
      avgTimeOnSite: "3:55",
      bounceRate: "33.2%",
      visitorsByTime: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
          {
            label: "Visitors",
            data: [8500, 9200, 8900, 9100],
            borderColor: "#1f8ef1",
            fill: true,
            backgroundColor: "rgba(31, 142, 241, 0.2)",
          },
        ],
      },
    },
  });

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: {
          drawBorder: false,
          color: "rgba(29,140,248,0.1)",
          zeroLineColor: "transparent",
        },
        ticks: {
          color: "#9a9a9a",
        },
      },
      x: {
        grid: {
          drawBorder: false,
          color: "rgba(29,140,248,0.1)",
          zeroLineColor: "transparent",
        },
        ticks: {
          color: "#9a9a9a",
        },
      },
    },
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#9a9a9a",
        },
      },
    },
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col xs="12">
            <Card className="card-chart">
              <CardHeader>
                <Row>
                  <Col className="text-left" sm="6">
                    <h5 className="card-category">Total Visitors</h5>
                    <CardTitle tag="h2">Visitor Analytics</CardTitle>
                  </Col>
                  <Col sm="6">
                    <ButtonGroup
                      className="btn-group-toggle float-right"
                      data-toggle="buttons"
                    >
                      <Button
                        tag="label"
                        className={classNames("btn-simple", {
                          active: timeRange === "daily",
                        })}
                        color="info"
                        id="0"
                        size="sm"
                        onClick={() => setTimeRange("daily")}
                      >
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Daily
                        </span>
                        <span className="d-block d-sm-none">D</span>
                      </Button>
                      <Button
                        color="info"
                        id="1"
                        size="sm"
                        tag="label"
                        className={classNames("btn-simple", {
                          active: timeRange === "weekly",
                        })}
                        onClick={() => setTimeRange("weekly")}
                      >
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Weekly
                        </span>
                        <span className="d-block d-sm-none">W</span>
                      </Button>
                      <Button
                        color="info"
                        id="2"
                        size="sm"
                        tag="label"
                        className={classNames("btn-simple", {
                          active: timeRange === "monthly",
                        })}
                        onClick={() => setTimeRange("monthly")}
                      >
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Monthly
                        </span>
                        <span className="d-block d-sm-none">M</span>
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart-area" style={{ height: 300 }}>
                  <Line
                    data={visitorData[timeRange].visitorsByTime}
                    options={chartOptions}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="3">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Statistics</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-send text-success" />{" "}
                  {visitorData[timeRange].pageViews}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stats">
                  <p className="card-category">Page Views</p>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Statistics</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-single-02 text-info" />{" "}
                  {visitorData[timeRange].uniqueVisitors}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stats">
                  <p className="card-category">Unique Visitors</p>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Statistics</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-time-alarm text-primary" />{" "}
                  {visitorData[timeRange].avgTimeOnSite}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stats">
                  <p className="card-category">Avg. Time on Site</p>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Statistics</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-refresh-01 text-warning" />{" "}
                  {visitorData[timeRange].bounceRate}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="stats">
                  <p className="card-category">Bounce Rate</p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="4">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Device Distribution</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area" style={{ height: 250 }}>
                  <Pie
                    data={visitorData.daily.deviceDistribution}
                    options={pieOptions}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="8">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Top Pages</CardTitle>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Page</th>
                      <th>Views</th>
                      <th>Avg. Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorData.daily.topPages.map((page, index) => (
                      <tr key={index}>
                        <td>{page.page}</td>
                        <td>{page.views}</td>
                        <td>{page.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Recent Visitors</CardTitle>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>IP Address</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Time</th>
                      <th>Page</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorData.daily.recentVisitors.map((visitor) => (
                      <tr key={visitor.id}>
                        <td>{visitor.ip}</td>
                        <td>{visitor.location}</td>
                        <td>{visitor.device}</td>
                        <td>{visitor.time}</td>
                        <td>{visitor.page}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Visitors; 