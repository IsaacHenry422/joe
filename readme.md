 # crownlist_node
 CROWNLIST  BACKEND API

Phase 1: Core Authentication & User Management
1.	Set Up User Authentication (bcrypt, role-based access control for buyers, sellers, and admins).
User Registration – Buyers & sellers can sign up.
Sign-In (Login) – Authenticate users with JWT.( after sign in , a token will sent to be registered email b4 login)
 Password Hashing – Secure passwords using bcrypt.
Role Assignment – Assign roles (buyer, seller, admin).
 Session Management – Prevent multiple logins if needed.

2. Implement User Roles & Permissions (buyers can purchase, sellers can list products, admins manage disputesand review pending  listed product).
3. Create Database Schema (design collections/tables for users, products, orders, transactions(and more ).).

Phase 2: Paystack Integration & Payment Flow
      4. Integrate Paystack for Buyer Payments (set up Paystack API to process payments).
     5. Implement Escrow System (hold funds until order completion, then release to the seller).
     6. Set Up Paystack Webhooks (track payment success, refunds, and disputes).

Phase 3: Marketplace Core Features
 
 
 7. Product Listing & Management (sellers can add/edit/remove products).

 8. Order Management (buyers can place orders, sellers can track sales).
 9. Dispute Resolution System(necessary ?) (
allow buyers to open disputes if needed  
The product not being delivered on time.
The item received is damaged or defective.
The item does not match the description provided by the seller.
Incorrect quantity or missing parts.
  ).
Phase 4: Admin Controls & Optimization
 10. Admin Dashboard & Control Panel (manage users, transactions, disputes, and verify sellers).

 
