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
// reactstrap components
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
} from "reactstrap";

function Messages() {
  const [modal, setModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "MSG001",
      customer: "John Doe",
      subject: "Order Inquiry",
      message: "I have a question about my recent order #ORD001. When will it be shipped?",
      date: "2024-03-09 14:30",
      status: "Unread",
      priority: "Medium",
      category: "Order Support",
      email: "john.doe@email.com",
      replies: [
        {
          from: "Support Team",
          message: "Hi John, your order is being processed and will be shipped within 24 hours.",
          date: "2024-03-09 15:00",
        },
      ],
    },
    {
      id: "MSG002",
      customer: "Jane Smith",
      subject: "Product Return",
      message: "I would like to return the item I received as it's damaged.",
      date: "2024-03-08 09:15",
      status: "In Progress",
      priority: "High",
      category: "Returns",
      email: "jane.smith@email.com",
      replies: [],
    },
    {
      id: "MSG003",
      customer: "Bob Johnson",
      subject: "Payment Issue",
      message: "My payment was declined but money was deducted from my account.",
      date: "2024-03-07 16:45",
      status: "Resolved",
      priority: "High",
      category: "Payment",
      email: "bob.johnson@email.com",
      replies: [
        {
          from: "Support Team",
          message: "We've investigated the issue and the refund has been processed.",
          date: "2024-03-07 17:30",
        },
        {
          from: "Bob Johnson",
          message: "Thank you for the quick resolution!",
          date: "2024-03-07 17:45",
        },
      ],
    },
  ]);
  const [reply, setReply] = useState("");

  const toggle = () => {
    setModal(!modal);
    if (!modal) {
      setSelectedMessage(null);
      setReply("");
    }
  };

  const viewMessage = (message) => {
    setSelectedMessage(message);
    if (message.status === "Unread") {
      updateMessageStatus(message.id, "Read");
    }
    toggle();
  };

  const updateMessageStatus = (messageId, newStatus) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: newStatus } : msg
      )
    );
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const newReply = {
      from: "Support Team",
      message: reply,
      date: new Date().toLocaleString(),
    };

    setMessages(
      messages.map((msg) =>
        msg.id === selectedMessage.id
          ? {
              ...msg,
              replies: [...msg.replies, newReply],
              status: "In Progress",
            }
          : msg
      )
    );

    setReply("");
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "unread":
        return "danger";
      case "in progress":
        return "warning";
      case "resolved":
        return "success";
      case "read":
        return "info";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <Row>
                  <Col className="text-left" sm="6">
                    <CardTitle tag="h4">Messages</CardTitle>
                    <p className="card-category">
                      Manage customer inquiries and support tickets
                    </p>
                  </Col>
                  <Col className="text-right" sm="6">
                    <Button
                      className="btn-fill"
                      color="primary"
                      onClick={() => {}}
                    >
                      Export Messages
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message) => (
                      <tr key={message.id}>
                        <td>{message.id}</td>
                        <td>{message.customer}</td>
                        <td>{message.subject}</td>
                        <td>{message.date}</td>
                        <td>
                          <Badge color={getStatusBadgeColor(message.status)}>
                            {message.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge color={getPriorityBadgeColor(message.priority)}>
                            {message.priority}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <Button
                            className="btn-link"
                            color="info"
                            size="sm"
                            onClick={() => viewMessage(message)}
                            title="View Message"
                          >
                            <i className="tim-icons icon-email-85" />
                          </Button>
                          <Button
                            className="btn-link"
                            color={message.status === "Resolved" ? "success" : "warning"}
                            size="sm"
                            onClick={() =>
                              updateMessageStatus(
                                message.id,
                                message.status === "Resolved" ? "In Progress" : "Resolved"
                              )
                            }
                            title={message.status === "Resolved" ? "Reopen" : "Resolve"}
                          >
                            <i
                              className={`tim-icons ${
                                message.status === "Resolved"
                                  ? "icon-refresh-01"
                                  : "icon-check-2"
                              }`}
                            />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Message Details Modal */}
        <Modal isOpen={modal} toggle={toggle} size="lg">
          <ModalHeader toggle={toggle}>
            Message Details - {selectedMessage?.id}
          </ModalHeader>
          <ModalBody>
            {selectedMessage && (
              <>
                <Row>
                  <Col md="6">
                    <h6>Customer Information</h6>
                    <p>Name: {selectedMessage.customer}</p>
                    <p>Email: {selectedMessage.email}</p>
                    <p>Category: {selectedMessage.category}</p>
                  </Col>
                  <Col md="6">
                    <h6>Message Information</h6>
                    <p>Date: {selectedMessage.date}</p>
                    <p>
                      Status:{" "}
                      <Badge color={getStatusBadgeColor(selectedMessage.status)}>
                        {selectedMessage.status}
                      </Badge>
                    </p>
                    <p>
                      Priority:{" "}
                      <Badge color={getPriorityBadgeColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                    </p>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md="12">
                    <h6>Subject</h6>
                    <p>{selectedMessage.subject}</p>
                    <h6>Message</h6>
                    <p>{selectedMessage.message}</p>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md="12">
                    <h6>Conversation History</h6>
                    <div
                      className="conversation-history"
                      style={{ maxHeight: "200px", overflowY: "auto" }}
                    >
                      {selectedMessage.replies.map((reply, index) => (
                        <div
                          key={index}
                          className={`message ${
                            reply.from === "Support Team" ? "text-info" : ""
                          }`}
                          style={{ marginBottom: "15px" }}
                        >
                          <p>
                            <strong>{reply.from}</strong> - {reply.date}
                          </p>
                          <p>{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md="12">
                    <h6>Reply</h6>
                    <Form onSubmit={handleReply}>
                      <FormGroup>
                        <Input
                          type="textarea"
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Type your reply here..."
                          rows="4"
                        />
                      </FormGroup>
                      <Button color="primary" type="submit">
                        Send Reply
                      </Button>
                    </Form>
                  </Col>
                </Row>
              </>
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

export default Messages; 