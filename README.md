# 📋 TaskBoard - Real-time Task Management Application

A modern, Jira-like project management application with real-time task updates using Socket.io. Built with Node.js, Express and MongoDB.

## 🚀 Features

### ✨ Core Features
- **📁 Folder Management**: Organize projects into folders with member management
- **📊 Project Management**: Create and manage projects within folders
- **📋 Kanban Board**: Drag-and-drop task management with customizable columns
- **⚡ Real-time Updates**: Live synchronization using Socket.io for collaborative work
- **🔐 Authentication & Authorization**: JWT-based secure authentication with role-based access control
- **👥 Team Collaboration**: Add members to folders and projects with permission management
- **🔍 Task Filtering & Sorting**: Advanced filtering and sorting capabilities
- **📝 Task Assignment**: Assign tasks to team members with priority levels
- **📅 Due Dates**: Set and track task deadlines

### 🛡️ Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Route-based rate limiting for API protection (configurable per route type)
- Helmet.js for security headers
- CORS configuration
- Input validation with Joi

### 🧪 Testing
- Comprehensive test suite with Vitest
- Unit tests for services, controllers, and middlewares
- Integration tests for API endpoints
- Test coverage reporting
- CI/CD with GitHub Actions

## 📁 Project Structure

```
realtime-task-board-app/
├── .github/
│   └── workflows/
│       └── test.yml              # GitHub Actions CI/CD workflow
├── src/                          # Backend source code
│   ├── config/                   # Configuration files
│   │   ├── database.js          # MongoDB connection
│   │   ├── env.js               # Environment variables
│   │   └── logger.js            # Winston logger setup
│   ├── controllers/             # Route controllers
│   ├── middlewares/             # Express middlewares
│   │   ├── auth.middleware.js  # JWT authentication
│   │   ├── error.handler.js    # Error handling
│   │   └── rate.limiter.js     # Rate limiting
│   ├── models/                  # Mongoose models
│   │   ├── User.js
│   │   ├── Folder.js
│   │   ├── Project.js
│   │   ├── Column.js
│   │   └── Task.js
│   ├── routes/                  # API routes
│   ├── services/                # Business logic layer
│   ├── socket/                  # Socket.io handlers
│   │   └── handlers/
│   │       └── task.handlers.js # Task event handlers
│   ├── utils/                   # Utility functions
│   │   └── errors/             # Custom error classes
│   ├── validation/              # Joi validation schemas
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── test/                        # Test files
│   ├── unit/                   # Unit tests
│   ├── integration/            # Integration tests
│   └── setup.js                # Test setup (MongoDB Memory Server)
├── coverage/                    # Test coverage reports
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Docker image configuration
├── vitest.config.js            # Vitest configuration
└── package.json                # Dependencies and scripts
```

## 🛠️ Technologies Used

### Backend
- **Node.js** (v20+) - JavaScript runtime
- **Express.js** (v5) - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** (v9) - MongoDB ODM
- **Socket.io** (v4) - Real-time communication
- **JWT** - Authentication tokens
- **Joi** - Schema validation
- **Winston** - Logging
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### Testing
- **Vitest** - Test framework
- **Supertest** - HTTP assertions
- **mongodb-memory-server** - In-memory MongoDB for testing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline

## 📦 Installation

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (v8.0 or higher) or MongoDB Atlas account
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realtime-task-board-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create a `.env.development` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # MongoDB Configuration
   DB_URI=mongodb://localhost:27017/taskboard
   # Or use MongoDB Atlas:
   # DB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskboard
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Rate Limiting Configuration
   # RATE_LIMIT_WINDOW: Time window for rate limiting (format: number + unit)
   # Supported units: d (days), h (hours), m (minutes), s (seconds)
   # Examples: "15m", "1h", "30m", "60s"
   RATE_LIMIT_WINDOW=15m
   
   # RATE_LIMIT_MAX: Maximum number of requests allowed per window for auth routes
   # Other route types use multipliers:
   # - auth: 1x (base value)
   # - default: 2x
   # - task, project, folder, column: 3x
   # - user: 2x
   RATE_LIMIT_MAX=100
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker Compose
   docker-compose up -d mongodb
   
   # Or start MongoDB service manually
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Docker Setup

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB container on port `27017`
   - Application container on port `5000`

2. **View logs**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop containers**
   ```bash
   docker-compose down
   ```

## 🧪 Testing

### Run Tests
```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
Coverage reports are generated in the `coverage/` directory. Open `coverage/index.html` in your browser to view detailed coverage reports.

## 🚦 Rate Limiting

The application uses route-based rate limiting to protect API endpoints from abuse. Different route types have different rate limits based on their usage patterns.

### Rate Limit Configuration

Rate limits are configured using environment variables:
- `RATE_LIMIT_WINDOW`: Time window for rate limiting (format: `number + unit`)
  - Supported units: `d` (days), `h` (hours), `m` (minutes), `s` (seconds)
  - Examples: `"15m"`, `"1h"`, `"30m"`, `"60s"`
- `RATE_LIMIT_MAX`: Base limit for auth routes (other routes use multipliers)

### Route Type Limits

| Route Type | Multiplier | Example Limit* |
|------------|------------|-----------------|
| `auth` | 1x (base) | 100 requests/15m |
| `default` | 2x | 200 requests/15m |
| `user` | 2x | 200 requests/15m |
| `task` | 3x | 300 requests/15m |
| `project` | 3x | 300 requests/15m |
| `folder` | 3x | 300 requests/15m |
| `column` | 3x | 300 requests/15m |

*Based on default `RATE_LIMIT_MAX=100` and `RATE_LIMIT_WINDOW=15m`

### Usage in Routes

Rate limiting is applied using the `rateLimit()` function:

```javascript
import { rateLimit } from '#src/middlewares/rate.limiter.js';

// Auth routes (stricter limits)
router.post('/login', rateLimit('auth'), validate(loginSchema), authController.login);

// Task routes (higher limits)
router.post('/tasks', rateLimit('task'), authMiddleware, taskController.createTask);

// Default limit
router.get('/data', rateLimit('default'), authMiddleware, dataController.getData);
// or simply
router.get('/data', rateLimit(), authMiddleware, dataController.getData);
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/auth/logout
Cookie: token=<jwt-token>
```

### Folder Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/folders` | Get user's folders | ✅ |
| GET | `/api/folders/:id` | Get folder by ID | ✅ |
| POST | `/api/folders` | Create folder | ✅ |
| PUT | `/api/folders/:id` | Update folder | ✅ |
| DELETE | `/api/folders/:id` | Delete folder | ✅ |
| POST | `/api/folders/:id/members` | Add member to folder | ✅ |
| DELETE | `/api/folders/:id/members/:userId` | Remove member from folder | ✅ |

### Project Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/folders/:folderId/projects` | Get projects in folder | ✅ |
| GET | `/api/projects/:id` | Get project by ID | ✅ |
| POST | `/api/folders/:folderId/projects` | Create project | ✅ |
| PUT | `/api/projects/:id` | Update project | ✅ |
| DELETE | `/api/projects/:id` | Delete project | ✅ |
| PATCH | `/api/projects/:id/status` | Update project status | ✅ |
| POST | `/api/projects/:id/members` | Add member to project | ✅ |
| DELETE | `/api/projects/:id/members/:userId` | Remove member from project | ✅ |

### Column Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects/:projectId/columns` | Get columns in project | ✅ |
| GET | `/api/columns/:id` | Get column by ID | ✅ |
| POST | `/api/projects/:projectId/columns` | Create column | ✅ |
| PUT | `/api/columns/:id` | Update column | ✅ |
| DELETE | `/api/columns/:id` | Delete column | ✅ |
| PATCH | `/api/columns/:id/reorder` | Reorder column | ✅ |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects/:projectId/tasks` | Get tasks in project | ✅ |
| GET | `/api/tasks/:id` | Get task by ID | ✅ |
| POST | `/api/projects/:projectId/tasks` | Create task | ✅ |
| PUT | `/api/tasks/:id` | Update task | ✅ |
| DELETE | `/api/tasks/:id` | Delete task | ✅ |
| PATCH | `/api/tasks/:id/move` | Move task to different column | ✅ |
| PATCH | `/api/tasks/:id/reorder` | Reorder task | ✅ |
| POST | `/api/tasks/:id/assignees` | Add assignee to task | ✅ |
| DELETE | `/api/tasks/:id/assignees/:userId` | Remove assignee from task | ✅ |

### Example: Create Task
```http
POST /api/projects/:projectId/tasks
Content-Type: application/json
Cookie: token=<jwt-token>

{
  "columnId": "column-id",
  "title": "Implement feature X",
  "description": "Add new feature to the application",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignees": ["user-id-1", "user-id-2"]
}
```

## 🔌 Socket.io Events

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task:join-project` | `{ projectId: string }` | Join project room for real-time updates |
| `task:leave-project` | `{ projectId: string }` | Leave project room |
| `task:create` | `{ projectId, taskData }` | Create task (emits to room) |
| `task:update` | `{ taskId, updates }` | Update task (emits to room) |
| `task:delete` | `{ taskId, projectId }` | Delete task (emits to room) |
| `task:move` | `{ taskId, newColumnId, orderIndex }` | Move task (emits to room) |
| `task:reorder` | `{ taskId, newOrderIndex }` | Reorder task (emits to room) |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task:created` | `{ task }` | Task created event |
| `task:updated` | `{ task }` | Task updated event |
| `task:deleted` | `{ taskId, projectId }` | Task deleted event |
| `task:moved` | `{ task, oldColumnId, newColumnId }` | Task moved event |
| `task:reordered` | `{ taskId, newOrderIndex }` | Task reordered event |
| `task:error` | `{ error: string }` | Error event |
| `task:joined-project` | `{ projectId }` | Confirmation of joining project |
| `task:left-project` | `{ projectId }` | Confirmation of leaving project |

### Example: Socket.io Client Usage
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join project room
socket.emit('task:join-project', { projectId: 'project-id' });

// Listen for task updates
socket.on('task:created', (data) => {
  console.log('New task created:', data.task);
});

socket.on('task:updated', (data) => {
  console.log('Task updated:', data.task);
});
```

## 🗄️ Database Models

### User
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  avatar: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Folder
```javascript
{
  name: String (required),
  description: String (optional),
  owner: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  name: String (required),
  description: String (optional),
  folderId: ObjectId (ref: Folder, required),
  owner: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  status: String (enum: ['active', 'archived'], default: 'active'),
  createdAt: Date,
  updatedAt: Date
}
```

### Column
```javascript
{
  name: String (required),
  projectId: ObjectId (ref: Project, required),
  orderIndex: Number (required, default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  columnId: ObjectId (ref: Column, required),
  projectId: ObjectId (ref: Project, required),
  title: String (required),
  description: String (required),
  orderIndex: Number (required, default: 0),
  assignees: [ObjectId] (ref: User),
  priority: String (enum: ['low', 'medium', 'high'], default: 'medium'),
  dueDate: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 CI/CD

This project uses GitHub Actions for continuous integration. Every push triggers automated tests.

### GitHub Actions Workflow
- **Trigger**: On push and pull requests to any branch
- **Jobs**:
  - Run tests with Node.js 20.x
  - Generate test coverage reports
  - Validate code quality

View workflow file: `.github/workflows/test.yml`

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run format` | Format code with Prettier |

## 🔒 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | ✅ | - |
| `PORT` | Server port | ✅ | - |
| `DB_URI` | MongoDB connection string | ✅ | - |
| `JWT_SECRET` | JWT signing secret | ✅ | - |
| `JWT_EXPIRES_IN` | JWT expiration time | ✅ | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | ✅ | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | ✅ | - |
| `FRONTEND_URL` | Frontend application URL | ✅ | - |
| `RATE_LIMIT_WINDOW` | Rate limit time window (format: number + unit, e.g., "15m", "1h") | ✅ | - |
| `RATE_LIMIT_MAX` | Max requests per window for auth routes (base value) | ✅ | - |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Developed with ❤️ for efficient project management and team collaboration.
