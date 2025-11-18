# E-Commerce Platform

This is a full-stack e-commerce application built with a Laravel API backend and a React frontend. It includes features for product management, order processing, user authentication, and an admin dashboard for reporting and management.

## Backend (Laravel)

The backend is a Laravel application that provides a RESTful API for the e-commerce platform.

### Technologies Used

- PHP 8.2
- Laravel 11
- Sanctum for authentication
- Swagger for API documentation
- Redis for caching

### Installation

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install Composer dependencies:
   ```bash
   composer install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Generate an application key:
   ```bash
   php artisan key:generate
   ```
5. Configure your database and other environment variables in the `.env` file.
6. Run database migrations:
   ```bash
   php artisan migrate
   ```

### Running the Development Server

To start the development server, run the following command in the `backend` directory:

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`.

## Frontend (React)

The frontend is a React application that provides the user interface for the e-commerce platform.

### Technologies Used

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios

### Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Configure your API URL and other environment variables in the `.env` file.

### Running the Development Server

To start the development server, run the following command in the `frontend` directory:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## API Documentation

The API is documented using Swagger. To view the documentation, run the backend server and navigate to the following URL in your browser:

[http://localhost:8000/api/documentation](http://localhost:8000/api/documentation)
