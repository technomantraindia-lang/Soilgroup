# Soilgroup Backend

Separate backend folder for enquiry APIs and the admin panel.

## What is included

- Public enquiry API for the website form
- Admin login with a dashboard
- Category management page
- Product management page
- Enquiry management page
- Local JSON storage for enquiries, categories, and products
- No external dependencies required

## Run the backend

```bash
cd backend
node src/server.js
```

Or from the project root:

```bash
npm run backend
```

## Admin panel

- URL: `http://localhost:4000/admin`
- Default username: `admin`
- Default password: `admin123`

Change these values with a `backend/.env` file based on `.env.example`.

## Admin sections

- `Dashboard`: counts and recent activity
- `Categories`: add and delete categories
- `Products`: add and delete products
- `Enquiries`: review, update status, and delete enquiries

## API routes

- `GET /api/health`
- `POST /api/enquiries`
- `POST /api/admin/login`
- `GET /api/admin/stats`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/enquiries`
- `PATCH /api/admin/enquiries/:id`
- `DELETE /api/admin/enquiries/:id`
