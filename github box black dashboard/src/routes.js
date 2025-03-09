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
import Dashboard from "views/Dashboard.js";
import Categories from "views/Categories.js";
import Products from "views/Products.js";
import Orders from "views/Orders.js";
import Messages from "views/Messages.js";
import Users from "views/Users.js";
import Visitors from "views/Visitors.js";
import UserProfile from "views/UserProfile.js";

var routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    rtlName: "لوحة القيادة",
    icon: "tim-icons icon-chart-pie-36",
    component: <Dashboard />,
    layout: "/admin",
  },
  {
    path: "/categories",
    name: "Categories",
    rtlName: "الفئات",
    icon: "tim-icons icon-components",
    component: <Categories />,
    layout: "/admin",
  },
  {
    path: "/products",
    name: "Products",
    rtlName: "المنتجات",
    icon: "tim-icons icon-cart",
    component: <Products />,
    layout: "/admin",
  },
  {
    path: "/orders",
    name: "Orders",
    rtlName: "الطلبات",
    icon: "tim-icons icon-delivery-fast",
    component: <Orders />,
    layout: "/admin",
  },
  {
    path: "/messages",
    name: "Messages",
    rtlName: "الرسائل",
    icon: "tim-icons icon-email-85",
    component: <Messages />,
    layout: "/admin",
  },
  {
    path: "/users",
    name: "Users",
    rtlName: "المستخدمون",
    icon: "tim-icons icon-single-02",
    component: <Users />,
    layout: "/admin",
  },
  {
    path: "/visitors",
    name: "Visitors",
    rtlName: "الزوار",
    icon: "tim-icons icon-tap-02",
    component: <Visitors />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    rtlName: "ملف تعريفي للمستخدم",
    icon: "tim-icons icon-single-02",
    component: <UserProfile />,
    layout: "/admin",
  }
];

export default routes;
