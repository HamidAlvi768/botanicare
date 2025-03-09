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
import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Label,
  FormGroup,
  Input,
  Table,
  Row,
  Col,
  UncontrolledTooltip,
  Badge,
} from "reactstrap";

// Custom hooks
import { useOrderStatistics, useRecentOrders } from "../hooks/useOrders";
import { useProductStatistics } from "../hooks/useProducts";
import { useUserStatistics } from "../hooks/useUsers";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4,
} from "variables/charts.js";

function Dashboard() {
  const [timeRange, setTimeRange] = React.useState("daily");
  
  // Fetch data using custom hooks
  const { data: orderStats, isLoading: orderStatsLoading } = useOrderStatistics({ timeRange });
  const { data: recentOrders, isLoading: recentOrdersLoading } = useRecentOrders(5);
  const { data: productStats, isLoading: productStatsLoading } = useProductStatistics();
  const { data: userStats, isLoading: userStatsLoading } = useUserStatistics();

  // Prepare chart data
  const getChartData = () => {
    if (!orderStats) return chartExample1.data1;

    return {
      labels: orderStats.timeline.map(item => item.date),
      datasets: [{
        label: "Sales",
        fill: true,
        borderColor: "#1f8ef1",
        borderWidth: 2,
        borderDash: [],
        borderDashOffset: 0.0,
        pointBackgroundColor: "#1f8ef1",
        pointBorderColor: "rgba(255,255,255,0)",
        pointHoverBackgroundColor: "#1f8ef1",
        pointBorderWidth: 20,
        pointHoverRadius: 4,
        pointHoverBorderWidth: 15,
        pointRadius: 4,
        data: orderStats.timeline.map(item => item.total),
      }]
    };
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
                    <h5 className="card-category">Total Sales</h5>
                    <CardTitle tag="h2">Performance</CardTitle>
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
                          active: timeRange === "monthly",
                        })}
                        onClick={() => setTimeRange("monthly")}
                      >
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Monthly
                        </span>
                        <span className="d-block d-sm-none">M</span>
                      </Button>
                      <Button
                        color="info"
                        id="2"
                        size="sm"
                        tag="label"
                        className={classNames("btn-simple", {
                          active: timeRange === "yearly",
                        })}
                        onClick={() => setTimeRange("yearly")}
                      >
                        <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                          Yearly
                        </span>
                        <span className="d-block d-sm-none">Y</span>
                      </Button>
                    </ButtonGroup>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  {!orderStatsLoading && (
                    <Line
                      data={getChartData()}
                      options={chartExample1.options}
                    />
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Total Revenue</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-money-coins text-success" />{" "}
                  {!orderStatsLoading && orderStats?.totalRevenue
                    ? `$${orderStats.totalRevenue.toLocaleString()}`
                    : "Loading..."}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={chartExample2.data}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Daily Orders</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-delivery-fast text-primary" />{" "}
                  {!orderStatsLoading && orderStats?.dailyOrders
                    ? orderStats.dailyOrders
                    : "Loading..."}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Bar
                    data={chartExample3.data}
                    options={chartExample3.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card className="card-chart">
              <CardHeader>
                <h5 className="card-category">Active Users</h5>
                <CardTitle tag="h3">
                  <i className="tim-icons icon-tap-02 text-info" />{" "}
                  {!userStatsLoading && userStats?.activeUsers
                    ? userStats.activeUsers
                    : "Loading..."}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="chart-area">
                  <Line
                    data={chartExample4.data}
                    options={chartExample4.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col lg="6">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Recent Orders</CardTitle>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!recentOrdersLoading &&
                      recentOrders?.map((order) => (
                        <tr key={order._id}>
                          <td>#{order.orderNumber}</td>
                          <td>{order.customer.name}</td>
                          <td>${order.totalAmount.toLocaleString()}</td>
                          <td>
                            <Badge
                              color={
                                order.status === "completed"
                                  ? "success"
                                  : order.status === "processing"
                                  ? "primary"
                                  : "warning"
                              }
                            >
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6">
            <Card>
              <CardHeader>
                <CardTitle tag="h4">Quick Stats</CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col md="6">
                    <Card className="card-stats">
                      <CardBody>
                        <Row>
                          <Col xs="5">
                            <div className="info-icon text-center icon-warning">
                              <i className="tim-icons icon-cart" />
                            </div>
                          </Col>
                          <Col xs="7">
                            <div className="numbers">
                              <p className="card-category">Products</p>
                              <CardTitle tag="h3">
                                {!productStatsLoading && productStats?.totalProducts
                                  ? productStats.totalProducts
                                  : "Loading..."}
                              </CardTitle>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6">
                    <Card className="card-stats">
                      <CardBody>
                        <Row>
                          <Col xs="5">
                            <div className="info-icon text-center icon-primary">
                              <i className="tim-icons icon-shape-star" />
                            </div>
                          </Col>
                          <Col xs="7">
                            <div className="numbers">
                              <p className="card-category">Orders</p>
                              <CardTitle tag="h3">
                                {!orderStatsLoading && orderStats?.totalOrders
                                  ? orderStats.totalOrders
                                  : "Loading..."}
                              </CardTitle>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Card className="card-stats">
                      <CardBody>
                        <Row>
                          <Col xs="5">
                            <div className="info-icon text-center icon-success">
                              <i className="tim-icons icon-single-02" />
                            </div>
                          </Col>
                          <Col xs="7">
                            <div className="numbers">
                              <p className="card-category">Customers</p>
                              <CardTitle tag="h3">
                                {!userStatsLoading && userStats?.totalCustomers
                                  ? userStats.totalCustomers
                                  : "Loading..."}
                              </CardTitle>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col md="6">
                    <Card className="card-stats">
                      <CardBody>
                        <Row>
                          <Col xs="5">
                            <div className="info-icon text-center icon-danger">
                              <i className="tim-icons icon-molecule-40" />
                            </div>
                          </Col>
                          <Col xs="7">
                            <div className="numbers">
                              <p className="card-category">Low Stock</p>
                              <CardTitle tag="h3">
                                {!productStatsLoading && productStats?.lowStockProducts
                                  ? productStats.lowStockProducts
                                  : "Loading..."}
                              </CardTitle>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Dashboard;
