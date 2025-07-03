# E-Commerce API

A RESTful API for an e-commerce platform built with [NestJS](https://nestjs.com/), TypeORM, and PostgreSQL. This project supports user authentication, product management, and category management, with JWT-based authentication and password reset via email.

## Features

- User registration, login, and profile management
- JWT authentication and authorization
- Password reset via email (Mailtrap integration)
- Product CRUD operations
- Category CRUD operations
- Modular, scalable code structure
- Input validation and serialization
- End-to-end and unit testing

## Tech Stack

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Passport.js](http://www.passportjs.org/) (JWT & Local strategies)
- [class-validator](https://github.com/typestack/class-validator)
- [class-transformer](https://github.com/typestack/class-transformer)
- [MailerModule](https://github.com/nest-modules/mailer) (Mailtrap for development)
- [Jest](https://jestjs.io/) (testing)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database
- [Mailtrap](https://mailtrap.io/) account for email testing

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory and set the following variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name
JWT_SECRET=your_jwt_secret
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_USERNAME=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_pass
```

### Running the App

```bash
# development
npm run start

# watch mode
npm run start:dev

# production
npm run build
npm run start:prod
```

### Running Tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## API Endpoints

### Auth

- `POST /auth/register` - Register a new user
- `POST /passAuth/login` - Login with email and password
- `POST /passAuth/forgotPassword` - Request password reset
- `PATCH /passAuth/resetPassword/:token` - Reset password with token

### User

- `GET /user/profile` - Get current user profile (JWT required)
- `PATCH /user/me/update` - Update user profile (JWT required)
- `DELETE /user/deleteMe` - Delete user account (JWT required)

### Product

- `POST /product/create` - Create a new product
- `GET /product` - List all products
- `GET /product/name` - Search products by name
- `PATCH /product/update/:id` - Update a product
- `DELETE /product/delete` - Delete a product

### Category

- `POST /category/create` - Create a new category
- `GET /category` - List all categories
- `GET /category/:id` - Get category by ID
- `PATCH /category/:id` - Update a category
- `DELETE /category/:id` - Delete a category

## Project Structure

- `src/`
  - `auth/` - Authentication and authorization logic
  - `user/` - User entity, DTOs, and service
  - `product/` - Product entity, DTOs, and service
  - `category/` - Category entity, DTOs, and service
  - `interceptors/` - Serialization interceptors
  - `utils/` - Utility functions

## License

This project is licensed under the UNLICENSED
