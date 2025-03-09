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
  Spinner,
  Alert,
} from "reactstrap";

// Custom hooks
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../hooks/useCategories";

function Categories() {
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  const toggle = () => {
    setModal(!modal);
    if (!modal) {
      setFormData({
        name: "",
        description: "",
        image: null,
      });
    }
  };

  const toggleEdit = (category = null) => {
    setEditModal(!editModal);
    setSelectedCategory(category);
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        image: null,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory.mutateAsync(formData);
      toggle();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCategory.mutateAsync({
        id: selectedCategory._id,
        data: formData,
      });
      toggleEdit();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  if (categoriesLoading) {
    return (
      <div className="content">
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="content">
        <Alert color="danger">
          Error loading categories: {categoriesError.message}
        </Alert>
      </div>
    );
  }

  const filteredCategories = searchTerm
    ? categoriesData?.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categoriesData;

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <Row>
                  <Col className="text-left" sm="6">
                    <CardTitle tag="h4">Categories</CardTitle>
                    <p className="card-category">
                      Manage your product categories
                    </p>
                  </Col>
                  <Col className="text-right" sm="6">
                    <Input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-3"
                    />
                    <Button
                      className="btn-fill"
                      color="primary"
                      onClick={toggle}
                    >
                      Add Category
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Products</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories?.map((category) => (
                      <tr key={category._id}>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td>{category.productsCount}</td>
                        <td className="text-right">
                          <Button
                            className="btn-link"
                            color="info"
                            size="sm"
                            onClick={() => toggleEdit(category)}
                          >
                            <i className="tim-icons icon-pencil" />
                          </Button>
                          <Button
                            className="btn-link"
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(category._id)}
                            disabled={category.productsCount > 0}
                            title={
                              category.productsCount > 0
                                ? "Cannot delete category with products"
                                : "Delete category"
                            }
                          >
                            <i className="tim-icons icon-simple-remove" />
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

        {/* Add Category Modal */}
        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader toggle={toggle}>Add New Category</ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <label>Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Category Name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <Input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Category Description"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Image</label>
                <Input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggle}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={createCategory.isLoading}
              >
                {createCategory.isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  "Add Category"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Edit Category Modal */}
        <Modal isOpen={editModal} toggle={() => toggleEdit()}>
          <ModalHeader toggle={() => toggleEdit()}>
            Edit Category
          </ModalHeader>
          <Form onSubmit={handleUpdate}>
            <ModalBody>
              <FormGroup>
                <label>Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Category Name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <Input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Category Description"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Image</label>
                <Input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => toggleEdit()}>
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={updateCategory.isLoading}
              >
                {updateCategory.isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  "Update Category"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Categories; 