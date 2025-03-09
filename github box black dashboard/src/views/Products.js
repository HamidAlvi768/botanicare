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
} from "reactstrap";

// Custom hooks
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useUpdateInventory,
} from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";

function Products() {
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch products with pagination and search
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    page,
    limit,
    search: searchTerm,
  });

  // Fetch categories for the dropdown
  const { data: categories } = useCategories();

  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateInventory = useUpdateInventory();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    images: [],
  });

  const toggle = () => {
    setModal(!modal);
    if (!modal) {
      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        images: [],
      });
    }
  };

  const toggleEdit = (product = null) => {
    setEditModal(!editModal);
    setSelectedProduct(product);
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        stock: product.stock,
        images: [],
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync(formData);
      toggle();
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProduct.mutateAsync({
        id: selectedProduct._id,
        data: formData,
      });
      toggleEdit();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleStockUpdate = async (id, quantity) => {
    try {
      await updateInventory.mutateAsync({ id, quantity });
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  if (productsLoading) {
    return (
      <div className="content">
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="content">
        <Alert color="danger">
          Error loading products: {productsError.message}
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
                    <CardTitle tag="h4">Products</CardTitle>
                    <p className="card-category">
                      Manage your product inventory
                    </p>
                  </Col>
                  <Col className="text-right" sm="6">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-3"
                    />
                    <Button
                      className="btn-fill"
                      color="primary"
                      onClick={toggle}
                    >
                      Add Product
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Table className="tablesorter" responsive>
                  <thead className="text-primary">
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsData?.products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>
                          <Input
                            type="number"
                            value={product.stock}
                            onChange={(e) =>
                              handleStockUpdate(product._id, e.target.value)
                            }
                            style={{ width: "80px" }}
                          />
                        </td>
                        <td>
                          <Badge
                            color={product.stock > 0 ? "success" : "danger"}
                          >
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </td>
                        <td className="text-right">
                          <Button
                            className="btn-link"
                            color="info"
                            size="sm"
                            onClick={() => toggleEdit(product)}
                          >
                            <i className="tim-icons icon-pencil" />
                          </Button>
                          <Button
                            className="btn-link"
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(product._id)}
                          >
                            <i className="tim-icons icon-simple-remove" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    Showing {productsData?.products.length} of{" "}
                    {productsData?.total} products
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
                        page ===
                        Math.ceil(productsData?.total / limit)
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

        {/* Add Product Modal */}
        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader toggle={toggle}>Add New Product</ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <label>Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Category</label>
                <Input
                  type="select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <Input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product Description"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Price</label>
                <Input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Product Price"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Stock</label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="Stock Quantity"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Images</label>
                <Input
                  type="file"
                  name="images"
                  onChange={handleInputChange}
                  multiple
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
                disabled={createProduct.isLoading}
              >
                {createProduct.isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  "Add Product"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Edit Product Modal */}
        <Modal isOpen={editModal} toggle={() => toggleEdit()}>
          <ModalHeader toggle={() => toggleEdit()}>
            Edit Product
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
                  placeholder="Product Name"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Category</label>
                <Input
                  type="select"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <FormGroup>
                <label>Description</label>
                <Input
                  type="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product Description"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Price</label>
                <Input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Product Price"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Stock</label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="Stock Quantity"
                  required
                />
              </FormGroup>
              <FormGroup>
                <label>Images</label>
                <Input
                  type="file"
                  name="images"
                  onChange={handleInputChange}
                  multiple
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
                disabled={updateProduct.isLoading}
              >
                {updateProduct.isLoading ? (
                  <Spinner size="sm" />
                ) : (
                  "Update Product"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Products; 