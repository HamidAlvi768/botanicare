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
  Nav,
  NavItem,
  NavLink,
  Spinner,
  Alert,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

// Custom hooks
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateRole,
} from "../hooks/useUsers";

function Users() {
  const [modal, setModal] = useState(false);
  const [activeTab, setActiveTab] = useState("customers");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [roleFilter, setRoleFilter] = useState("");

  // Fetch users with pagination, search, and filters
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers({
    page,
    limit,
    search: searchTerm,
    role: roleFilter,
    type: activeTab,
  });

  // Fetch single user details
  const {
    data: userDetails,
    isLoading: userDetailsLoading,
  } = useUser(selectedUser?._id);

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const updateRole = useUpdateRole();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const toggle = () => {
    setModal(!modal);
    if (!modal) {
      setSelectedUser(null);
      setNewUser({
        name: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await updateUser.mutateAsync({
          id: selectedUser._id,
          userData: {
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            address: newUser.address,
          },
        });
      } else {
        await createUser.mutateAsync({
          ...newUser,
          type: activeTab,
        });
      }
      toggle();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser.mutateAsync(userId);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUser.mutateAsync({
        id: userId,
        userData: { status: newStatus }
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateRole.mutateAsync({
        id: userId,
        role: newRole
      });
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      default:
        return "secondary";
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      address: user.address || "",
    });
    toggle();
  };

  if (usersLoading) {
    return (
      <div className="content">
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="content">
        <Alert color="danger">
          Error loading users: {usersError.message}
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
                    <CardTitle tag="h4">Users</CardTitle>
                    <p className="card-category">
                      Manage customers and admin users
                    </p>
                  </Col>
                  <Col className="text-right" sm="6">
                    <Row>
                      <Col sm="4">
                        <Input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-3"
                        />
                      </Col>
                      <Col sm="4">
                        <Input
                          type="select"
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="mb-3"
                        >
                          <option value="">All Roles</option>
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="support">Support</option>
                        </Input>
                      </Col>
                      <Col sm="4">
                        <Button
                          className="btn-fill"
                          color="primary"
                          onClick={toggle}
                        >
                          Add {activeTab === "customers" ? "Customer" : "Admin"}
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col>
                    <Nav tabs>
                      <NavItem>
                        <NavLink
                          className={activeTab === "customers" ? "active" : ""}
                          onClick={() => {
                            setActiveTab("customers");
                            setPage(1);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          Customers
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={activeTab === "admins" ? "active" : ""}
                          onClick={() => {
                            setActiveTab("admins");
                            setPage(1);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          Admins
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                {activeTab === "customers" ? (
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Join Date</th>
                        <th>Orders</th>
                        <th>Total Spent</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td>{user.orderCount}</td>
                          <td>${user.totalSpent.toFixed(2)}</td>
                          <td>
                            <Badge color={getStatusBadgeColor(user.status)}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="text-right">
                            <Button
                              className="btn-link"
                              color="info"
                              size="sm"
                              onClick={() => viewUserDetails(user)}
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
                                    handleStatusChange(user._id, "active")
                                  }
                                >
                                  Active
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() =>
                                    handleStatusChange(user._id, "inactive")
                                  }
                                >
                                  Inactive
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-danger"
                                >
                                  Delete User
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Table className="tablesorter" responsive>
                    <thead className="text-primary">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Last Login</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleString()
                              : "Never"}
                          </td>
                          <td>
                            <Badge color={getStatusBadgeColor(user.status)}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="text-right">
                            <Button
                              className="btn-link"
                              color="info"
                              size="sm"
                              onClick={() => viewUserDetails(user)}
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
                                <DropdownItem header>Update Role</DropdownItem>
                                <DropdownItem
                                  onClick={() =>
                                    handleRoleChange(user._id, "admin")
                                  }
                                >
                                  Admin
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() =>
                                    handleRoleChange(user._id, "support")
                                  }
                                >
                                  Support
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem header>Update Status</DropdownItem>
                                <DropdownItem
                                  onClick={() =>
                                    handleStatusChange(user._id, "active")
                                  }
                                >
                                  Active
                                </DropdownItem>
                                <DropdownItem
                                  onClick={() =>
                                    handleStatusChange(user._id, "inactive")
                                  }
                                >
                                  Inactive
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-danger"
                                >
                                  Delete User
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {usersData?.users.length} of {usersData?.total} users
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
                      disabled={page === Math.ceil(usersData?.total / limit)}
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

        {/* Add/Edit User Modal */}
        <Modal isOpen={modal} toggle={toggle} size="lg">
          <Form onSubmit={handleSubmit}>
            <ModalHeader toggle={toggle}>
              {selectedUser ? "Edit User" : `Add ${activeTab === "customers" ? "Customer" : "Admin"}`}
            </ModalHeader>
            <ModalBody>
              {(createUser.isError || updateUser.isError) && (
                <Alert color="danger">
                  Error saving user: {createUser.error?.message || updateUser.error?.message}
                </Alert>
              )}
              <Row>
                <Col md="6">
                  <FormGroup>
                    <label>Name</label>
                    <Input
                      type="text"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label>Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>
              {activeTab === "admins" && (
                <FormGroup>
                  <label>Role</label>
                  <Input
                    type="select"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="support">Support</option>
                  </Input>
                </FormGroup>
              )}
              {!selectedUser && (
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <label>Password</label>
                      <Input
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <label>Confirm Password</label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )}
              <Row>
                <Col md="6">
                  <FormGroup>
                    <label>Phone</label>
                    <Input
                      type="tel"
                      name="phone"
                      value={newUser.phone}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label>Address</label>
                    <Input
                      type="text"
                      name="address"
                      value={newUser.address}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={createUser.isLoading || updateUser.isLoading}
              >
                {createUser.isLoading || updateUser.isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  "Save"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Users; 