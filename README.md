# Student Registration System

A modern, full-stack student registration system built with React and Node.js.

## Features

- **Student Management** - Add, edit, and manage student profiles
- **Course Management** - Create and manage course offerings
- **Registration System** - Enroll students in courses
- **Dashboard Analytics** - Real-time system statistics
- **Modern UI** - Beautiful, responsive design with animations
- **Role-based Access** - Admin and student user roles

## Tech Stack

### Frontend
- React 18 with Hooks
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Hook Form for forms
- Recharts for analytics
- Lucide React for icons

### Backend
- Node.js with Express
- Sequelize ORM
- SQLite/PostgreSQL database
- JWT authentication
- bcryptjs for password hashing
- CORS and security middleware

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd student-registration-system
```

2. **Install Backend Dependencies**
```bash
cd Backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../Frontend
npm install
```

4. **Start Backend Server**
```bash
cd ../Backend
npm run dev
```

5. **Start Frontend Development Server**
```bash
cd ../Frontend
npm run dev
```

### Default Admin Account
- **Email:** admin@example.com
- **Password:** admin123

## Project Structure

```
student-registration-system/
├── Frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.js
├── Backend/
│   ├── config/             # Database and app configuration
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── package.json
│   └── index.js
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/profile` - Get user profile

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Registrations
- `GET /api/registrations` - Get all registrations
- `POST /api/registrations` - Create new registration
- `DELETE /api/registrations/:id` - Delete registration

## Environment Variables

Create `.env` files in both Frontend and Backend directories:

### Backend `.env`
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```

## Development

### Backend Development
```bash
cd Backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd Frontend
npm run dev  # Vite development server
```

### Production Build
```bash
cd Frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email taskflowt@gmail.com or create an issue in the repository.