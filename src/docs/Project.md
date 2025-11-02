Description:
Implement a backend service that handles user registration, login, and role-based
authorization (RBAC). Use JWT tokens for authentication and secure password hashing.
Steps to follow:
* Create user registration with email/password validation.
* Store passwords securely (e.g., bcrypt).
* Implement login endpoint that returns a JWT token.
* Create middleware to protect certain routes based on user roles (e.g., admin vs user).
* Demonstrate token expiration and refresh mechanism.