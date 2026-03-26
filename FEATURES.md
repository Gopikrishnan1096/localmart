# LocalMart Platform Features

LocalMart is a comprehensive hyperlocal marketplace platform composed of four main components: a centralized Backend API, a User Frontend for customers, a Shop Dashboard for vendors, and an Admin Dashboard for platform administrators.

Below is a detailed breakdown of the features currently implemented across the platform:

## 1. Authentication & Authorization (All Apps)
- **Role-Based Access Control (RBAC):** Three distinct user roles (`user`, `shopowner`, `admin`) with restricted access permissions.
- **JWT-Based Authentication:** Secure, stateless session management using JSON Web Tokens.
- **Registration & Login:** Secure password hashing (bcrypt) and protected route middleware for API endpoints.

## 2. Customer Application (`user-frontend`)
The web interface for end-users to discover local shops and purchase products.
- **Location-Based Shop Discovery:** Browse nearby shops available on the platform.
- **Product Browsing:** View product catalogs of individual shops, including details, pricing, and images.
- **Shopping Cart & Checkout:** Add products to a cart and securely place orders.
- **Order Tracking & History:** View past orders and track the live status of current orders (e.g., Pending, Accepted, Delivered, Cancelled).
- **Profile Management:** Update personal information and manage delivery addresses.

## 3. Vendor Application (`shop-dashboard`)
The management portal for individual shop owners to digitize their local business.
- **Shop Profile Management:** Update shop details, business hours, and store location.
- **Product Inventory Management:** 
  - Add new products with image uploads (handling max file sizes).
  - Edit existing product details, prices, and available stock.
  - Delete or hide products from the storefront.
- **Order Management:**
  - View incoming orders in real-time.
  - Update order statuses (e.g., mark as "Accepted", "Out for Delivery", or "Completed").
- **Sales Analytics:** Basic dashboard metrics displaying total sales, incoming orders, and revenue insights.

## 4. Platform Administration (`admin-dashboard`)
The centralized control panel for platform administrators to oversee the entire marketplace.
- **Platform Analytics:** Real-time statistics including total active users, registered shops, platform-wide revenue, and order volume.
- **User Management:** View all registered customers and shop owners; suspend or ban accounts if necessary.
- **Shop Oversight:** Approve or reject new shop registrations and monitor shop activities.
- **Global Order/Product Monitoring:** Access and oversee all products and orders across the platform for customer support and arbitration.

## 5. Backend Infrastructure (`backend`)
The Express/MongoDB API powering the entire platform.
- **RESTful API:** Clean, modular route structure for Auth, Users, Shops, Products, Orders, and Admin operations.
- **Database:** MongoDB Atlas for reliable and scalable data storage.
- **File Uploads:** Integrated handling for product and profile images.
- **CORS Management:** Specifically configured to securely allow traffic from the three distinct frontend origins.

---

### Potential Future Enhancements (To become a "Full-Featured" Marketplace)
If you are looking to build missing features, consider adding:
1. **Payment Gateway Integration:** (e.g., Stripe, Razorpay) for online transactions.
2. **Review & Rating System:** Allow users to rate shops and products.
3. **Delivery Partner App:** A fourth app/role for delivery riders to accept and track deliveries.
4. **Geolocation API Integration:** (e.g., Google Maps API) for precise distance calculation and address auto-complete.
5. **Real-Time Notifications:** (e.g., Socket.io or WebSockets) for instant order updates to shops and users.
