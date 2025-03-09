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
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
  Form,
  FormGroup,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Spinner,
  Alert,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

// Custom hooks
import {
  useOrders,
  useOrder,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useUpdateShipping,
} from "../hooks/useOrders";

function Orders() {
  const [modal, setModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch orders with pagination, search, and filters
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders({
    page,
    limit,
    search: searchTerm,
    status: statusFilter,
  });

  // Fetch single order details
  const {
    data: orderDetails,
    isLoading: orderDetailsLoading,
  } = useOrder(selectedOrder?._id);

  // Mutations
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const updateShipping = useUpdateShipping();

  const toggle = () => {
    setModal(!modal);
    if (!modal) setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await updatePaymentStatus.mutateAsync({ id: orderId, paymentStatus: newStatus });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const handleShippingUpdate = async (orderId, shippingData) => {
    try {
      await updateShipping.mutateAsync({ id: orderId, shippingData });
    } catch (error) {
      console.error("Error updating shipping information:", error);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    toggle();
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (ordersLoading) {
    return (
      <div className="content">
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="content">
        <Alert color="danger">
          Error loading orders: {ordersError.message}
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <Row>
                  <Col className="text-left" sm="6">
                    <CardTitle tag="h4">Orders</CardTitle>
                    <p className="card-category">
                      Manage and track customer orders
                    </p>
                  </Col>
                  <Col className="text-right" sm="6">
                    <Row>
                      <Col sm="4">
                        <Input
                          type="text"
                          placeholder="Search orders..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-3"
                        />
                      </Col>
                      <Col sm="4">
                        <Input
                          type="select"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="mb-3"
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </Input>
                      </Col>
                      <Col sm="4">
                        <Button
                          className="btn-fill"
                          color="primary"
                          onClick={() => {}}
                        >
                          Export Orders
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData?.orders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order.orderNumber}</td>
                        <td>{order.customer.name}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>
                          <Badge color={getStatusBadgeColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <Button
                            className="btn-link"
                            color="info"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <i className="tim-icons icon-zoom-split" />
                          </Button>
                          <UncontrolledDropdown>
                            <DropdownToggle
                              className="btn-link"
                              color="warning"
                              size="sm"
                            >
                              <i className="tim-icons icon-settings" />
                            </DropdownToggle>
                            <DropdownMenu right>
                              <DropdownItem header>Update Status</DropdownItem>
                              <DropdownItem
                                onClick={() =>
                                  handleStatusChange(order._id, "pending")
                                }
                              >
                                Pending
                              </DropdownItem>
                              <DropdownItem
                                onClick={() =>
                                  handleStatusChange(order._id, "processing")
                                }
                              >
                                Processing
                              </DropdownItem>
                              <DropdownItem
                                onClick={() =>
                                  handleStatusChange(order._id, "delivered")
                                }
                              >
                                Delivered
                              </DropdownItem>
                              <DropdownItem
                                onClick={() =>
                                  handleStatusChange(order._id, "cancelled")
                                }
                              >
                                Cancelled
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {ordersData?.orders.length} of {ordersData?.total} orders
                  </div>
                  <div>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={
                        page === Math.ceil(ordersData?.total / limit)
                      }
                      className="ml-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Order Details Modal */}
        <Modal isOpen={modal} toggle={toggle} size="lg">
          <ModalHeader toggle={toggle}>
            Order Details - #{orderDetails?.orderNumber}
          </ModalHeader>
          <ModalBody>
            {orderDetailsLoading ? (
              <div className="text-center">
                <Spinner color="primary" />
              </div>
            ) : orderDetails ? (
              <>
                <Row>
                  <Col md="6">
                    <h6>Customer Information</h6>
                    <p>Name: {orderDetails.customer.name}</p>
                    <p>Email: {orderDetails.customer.email}</p>
                    <p>Phone: {orderDetails.customer.phone}</p>
                    <p>
                      Status:{" "}
                      <Badge color={getStatusBadgeColor(orderDetails.status)}>
                        {orderDetails.status}
                      </Badge>
                    </p>
                  </Col>
                  <Col md="6">
                    <h6>Shipping Information</h6>
                    <p>Address: {orderDetails.shipping.address}</p>
                    <p>City: {orderDetails.shipping.city}</p>
                    <p>Country: {orderDetails.shipping.country}</p>
                    <p>Method: {orderDetails.shipping.method}</p>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md="12">
                    <h6>Order Items</h6>
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map((item) => (
                          <tr key={item._id}>
                            <td>{item.product.name}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price.toFixed(2)}</td>
                            <td>${(item.quantity * item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan="3" className="text-right">
                            <strong>Subtotal:</strong>
                          </td>
                          <td>${orderDetails.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-right">
                            <strong>Shipping:</strong>
                          </td>
                          <td>${orderDetails.shippingCost.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-right">
                            <strong>Tax:</strong>
                          </td>
                          <td>${orderDetails.tax.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan="3" className="text-right">
                            <strong>Total:</strong>
                          </td>
                          <td>
                            <strong>${orderDetails.totalAmount.toFixed(2)}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md="6">
                    <h6>Payment Information</h6>
                    <p>Method: {orderDetails.payment.method}</p>
                    <p>
                      Status:{" "}
                      <Badge
                        color={
                          orderDetails.payment.status === "paid"
                            ? "success"
                            : "warning"
                        }
                      >
                        {orderDetails.payment.status}
                      </Badge>
                    </p>
                    {orderDetails.payment.transactionId && (
                      <p>Transaction ID: {orderDetails.payment.transactionId}</p>
                    )}
                  </Col>
                  <Col md="6">
                    <h6>Order Timeline</h6>
                    {orderDetails.timeline.map((event, index) => (
                      <div key={index} className="mb-2">
                        <small className="text-muted">
                          {new Date(event.timestamp).toLocaleString()}
                        </small>
                        <p className="mb-0">{event.description}</p>
                      </div>
                    ))}
                  </Col>
                </Row>
              </>
            ) : (
              <Alert color="danger">Error loading order details</Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggle}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </>
  );
}

export default Orders; 