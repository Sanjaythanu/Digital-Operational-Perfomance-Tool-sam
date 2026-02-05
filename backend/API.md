# DOPT API Documentation

## Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive token

## Users (Admin Only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

## Operations
- `POST /api/operations` - Create new operation
- `GET /api/operations` - Get operations (User: own, Admin: all)
- `PUT /api/operations/:id` - Update operation
- `DELETE /api/operations/:id` - Delete operation

## Analytics
- `GET /api/analytics` - Get dashboard statistics
