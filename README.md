# TaskBoard - Real-time Task Management Application

A modern, Jira-like project management application with real-time task updates using Socket.io. Built with React + TypeScript frontend and Node.js + Express + MongoDB backend.

## Features

### Core Features

- **User Authentication**: Secure login and registration with JWT token management
- **Dashboard Overview**: Centralized view showing statistics and folder organization
- **Folder Management**: Organize projects into folders with member management
- **Project Management**: Create and manage projects within folders
- **Kanban Board**: Interactive drag-and-drop task management board with customizable columns
- **Real-time Updates**: Live synchronization using Socket.io for collaborative task management
- **Task Management**: Create, edit, assign, and track tasks with priorities and due dates
- **Task Filtering**: Advanced filtering by assignee, priority, and due date range
- **Member Management**: Add and remove members from folders and projects
- **Responsive Design**: Modern UI that works seamlessly on desktop and mobile devices

### User Interface Features

- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **Form Validation**: Client-side validation using Zod schemas with React Hook Form
- **Drag & Drop**: Intuitive task and column reordering with @dnd-kit
- **Real-time Notifications**: Instant updates when tasks are created, updated, or moved
- **Loading States**: Visual feedback during API operations
- **Error Handling**: User-friendly error messages and fallback UI

### Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Route-based rate limiting for API protection (configurable per route type)
- Helmet.js for security headers
- CORS configuration
- Input validation with Joi (backend) and Zod (frontend)

### Testing

- Comprehensive test suite with Vitest
- Unit tests for services, controllers, and middlewares
- Integration tests for API endpoints
- Test coverage reporting
- CI/CD with GitHub Actions

## Tech Stack

### Frontend

- **React 18** - UI library for building user interfaces
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Fast build tool and development server
- **React Router v6** - Client-side routing and navigation
- **Zustand** - Lightweight state management library
- **Axios** - HTTP client for API communication
- **Socket.io Client** - Real-time bidirectional communication
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality React component library built on Radix UI
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant form library with minimal re-renders
- **Zod** - TypeScript-first schema validation
- **@dnd-kit** - Modern drag-and-drop toolkit

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

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD pipeline

## Project Structure

```
realtime-task-board-app/
├── .github/
│   └── workflows/
│       └── test.yml              # GitHub Actions CI/CD workflow
├── client/                      # React frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── api/                # API client functions
│   │   ├── components/         # React components
│   │   │   ├── ui/            # Shadcn UI components
│   │   │   ├── AddMemberDialog.tsx
│   │   │   ├── ColumnCard.tsx
│   │   │   ├── ColumnForm.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── ...
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and configurations
│   │   ├── pages/             # Page components
│   │   │   ├── auth/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FolderDetail.tsx
│   │   │   └── ProjectDetail.tsx
│   │   ├── store/            # Zustand stores
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── server/                      # Node.js backend application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Express middlewares
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic layer
│   │   ├── socket/            # Socket.io handlers
│   │   ├── utils/             # Utility functions
│   │   ├── validation/        # Joi validation schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── test/                  # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.js
│   ├── coverage/              # Test coverage reports
│   ├── package.json
│   └── ...
├── media/                      # Screenshots and demo videos
│   ├── login.png
│   ├── register.png
│   ├── dashboard.png
│   ├── folder-create-dialog.png
│   ├── folder-detail.png
│   ├── project-create-dialog.png
│   ├── project-detail.png
│   ├── column-create-dialog.png
│   ├── create-task-dialog.png
│   └── create-task-with-socket.mp4
├── docker-compose.yml          # Docker Compose configuration
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites

- Node.js (v20 or higher)
- MongoDB (v8.0 or higher) or MongoDB Atlas account
- npm or yarn
- Docker and Docker Compose (optional, for containerized setup)

### Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realtime-task-board-app
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - MongoDB container on port `27017`
   - Backend server container on port `5000`
   - Frontend client container on port `3000`

3. **View logs**
   ```bash
   # View all logs
   docker-compose logs -f
   
   # View specific service logs
   docker-compose logs -f server
   docker-compose logs -f client
   ```

4. **Stop containers**
   ```bash
   docker-compose down
   ```

### Local Development Setup

#### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create a `.env.development` file in the `server` directory:
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
   RATE_LIMIT_WINDOW=15m
   RATE_LIMIT_MAX=100
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker Compose (from root directory)
   docker-compose up -d mongodb
   
   # Or start MongoDB service manually
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

#### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Environment Variables

#### Backend Environment Variables

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

#### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | No | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | No | `http://localhost:5000` |

## User Interface

### Authentication Pages

#### Login Page

The login page provides a clean, centered interface for user authentication.

![Login Page](media/login.png)

**Features:**
- Email and password input fields with validation
- Form validation with error messages
- Link to registration page for new users
- Automatic redirect to dashboard on successful login
- Loading state during authentication

**Form Fields:**
- **Email**: Valid email address (required)
- **Password**: Minimum 6 characters, maximum 32 characters (required)

#### Register Page

The registration page allows new users to create an account.

![Register Page](media/register.png)

**Features:**
- User registration form with email, first name, last name, and password
- Client-side validation with Zod schemas
- Success message and automatic redirect to login page
- Link to login page for existing users

**Form Fields:**
- **Email**: Valid email address (required)
- **First Name**: Required field
- **Last Name**: Required field
- **Password**: Minimum 6 characters, maximum 32 characters (required)

### Dashboard

The dashboard provides an overview of all folders, projects, and tasks.

![Dashboard](media/dashboard.png)

**Features:**
- **Statistics Cards**: Display total folders, projects, and tasks
- **Folder Cards**: Visual representation of folders with project and member counts
- **Quick Actions**: Create new folders directly from the dashboard
- **Navigation**: Click on folder cards to view folder details

**Statistics Display:**
- Total Folders: Count of all folders owned by or shared with the user
- Total Projects: Count of all projects across all folders
- Total Tasks: Count of all tasks across all projects

**Folder Card Information:**
- Folder name and description
- Number of projects in the folder
- Number of members in the folder
- Click to navigate to folder detail page

### Folder Management

#### Create Folder Dialog

The folder creation dialog allows users to create new folders for organizing projects.

![Create Folder Dialog](media/folder-create-dialog.png)

**Features:**
- Modal dialog with form validation
- Folder name input (required, max 100 characters)
- Description input (required, max 500 characters)
- Cancel and Create buttons

**Usage:**
- Click "+ Add New Folder" button in the sidebar or dashboard
- Fill in folder name and description
- Click "Create" to create the folder

#### Folder Detail Page

The folder detail page displays folder information and member management.

![Folder Detail Page](media/folder-detail.png)

**Features:**
- **Folder Information**: Display folder name and description
- **Owner Section**: Shows folder owner with avatar and email
- **Members Section**: List of all folder members
- **Add Members**: Button to add new members (visible to folder owner only)
- **Remove Members**: Remove members from folder (visible to folder owner only)

**Member Management:**
- View all members with avatars and email addresses
- Add new members via dialog
- Remove members (owner only)
- See member count in the members section

### Project Management

#### Create Project Dialog

The project creation dialog allows users to create new projects within a folder.

![Create Project Dialog](media/project-create-dialog.png)

**Features:**
- Modal dialog for creating projects
- Project name input (required, max 100 characters)
- Description input (required, max 500 characters)
- Created within the context of the selected folder

**Usage:**
- Navigate to a folder in the sidebar
- Click "+ Add New Project" under the folder
- Fill in project name and description
- Click "Create" to create the project

#### Project Detail Page (Kanban Board)

The project detail page displays a full-featured Kanban board for task management.

![Project Detail Page](media/project-detail.png)

**Features:**
- **Kanban Board**: Drag-and-drop task columns
- **Column Management**: Create, reorder, and delete columns
- **Task Cards**: Display tasks with assignees, due dates, and priorities
- **Task Filtering**: Filter by assignee, priority, and due date range
- **Real-time Updates**: Live synchronization with Socket.io
- **Task Actions**: Create, edit, delete, and move tasks

**Kanban Board Features:**
- **Columns**: Customizable workflow columns (e.g., Pending, In Progress, Completed, Launched)
- **Drag & Drop**: Move tasks between columns by dragging
- **Column Reordering**: Drag columns to reorder them
- **Task Cards**: Show task title, assignees, due date, and priority flag
- **Column Headers**: Display column name with task count

**Filtering Options:**
- **Due Date Range**: Filter tasks by date range using date pickers
- **Assignee**: Filter tasks by assigned user (dropdown with all users)
- **Priority**: Filter tasks by priority level (Low, Medium, High)

**Task Card Information:**
- Task title
- Assignee avatars (initials or images)
- Due date and time
- Priority indicator (color-coded flags)

### Column Management

#### Create Column Dialog

The column creation dialog allows users to add new columns to the Kanban board.

![Create Column Dialog](media/column-create-dialog.png)

**Features:**
- Simple modal dialog for column creation
- Column name input (required, max 50 characters)
- Created within the context of the current project
- Columns are automatically ordered

**Usage:**
- Navigate to a project detail page
- Click the "+" icon in the column header or use the "+ Add New" button
- Enter column name
- Click "Create" to add the column

**Column Features:**
- Customizable column names
- Automatic ordering (new columns appear at the end)
- Drag-and-drop reordering
- Delete option via column menu

### Task Management

#### Create/Edit Task Dialog

The task form dialog allows users to create and edit tasks with comprehensive options.

![Create Task Dialog](media/create-task-dialog.png)

**Features:**
- **Side Drawer**: Opens from the right side of the screen
- **Form Fields**:
  - **Title**: Task title (required, max 200 characters)
  - **Description**: Detailed task description (required, max 2000 characters)
  - **Column**: Select target column from dropdown
  - **Priority**: Choose priority level (Low, Medium, High)
  - **Due Date**: Date and time picker for task deadline
  - **Assignees**: Search and add multiple assignees with avatars

**Assignee Management:**
- Search users by name or email
- Display user avatars with initials
- Add multiple assignees to a task
- Remove assignees with X button
- Shows selected assignees as chips

**Form Validation:**
- Real-time validation with Zod schemas
- Error messages displayed below fields
- Required field indicators

**Usage:**
- Click "+" button in a column to create a task in that column
- Click on an existing task card to edit it
- Fill in task details
- Click "Create" or "Update" to save

### Real-time Features

The application uses Socket.io for real-time task updates. When a task is created, updated, moved, or deleted, all users viewing the same project will see the changes instantly.

**Real-time Events:**
- **Task Created**: New tasks appear immediately for all users
- **Task Updated**: Task changes sync in real-time
- **Task Moved**: Task column changes update instantly
- **Task Deleted**: Task removal syncs across all clients

**Video Demonstration:**

<video width="800" controls>
  <source src="media/create-task-with-socket.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## API Documentation

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

## Socket.io Events

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

## Database Models

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

## Rate Limiting

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

## State Management

The frontend application uses Zustand for state management with separate stores for different domains:

### Auth Store (`client/src/store/authStore.ts`)

Manages user authentication state:
- User information
- Authentication token
- Login/logout/register actions
- Token refresh mechanism
- Persistent storage with Zustand persist middleware

### Folder Store (`client/src/store/folderStore.ts`)

Manages folder and project data:
- Folder list
- Projects by folder
- Folder CRUD operations
- Project CRUD operations
- Member management
- Expanded/collapsed folder state

### Column Store (`client/src/store/columnStore.ts`)

Manages column data:
- Columns by project
- Column CRUD operations
- Column reordering

### Task Store (`client/src/store/taskStore.ts`)

Manages task data and Socket.io integration:
- Tasks by project
- Task CRUD operations
- Task movement between columns
- Socket.io event listeners
- Real-time updates synchronization

## Socket.io Integration

### Connection Setup

The Socket.io client is initialized in `client/src/lib/socket.ts`:

```typescript
import { io } from 'socket.io-client';

const socket = io(SOCKET_URL, {
  auth: {
    token: token || undefined,
  },
  withCredentials: true,
  autoConnect: false,
});
```

### Usage in Components

The task store initializes Socket.io listeners when a project is opened:

```typescript
// In ProjectDetail component
useEffect(() => {
  if (id) {
    initializeSocket();
    const socket = getSocket();
    if (socket) {
      connectSocket();
      socket.emit('task:join-project', id);
      
      return () => {
        socket.emit('task:leave-project', id);
        disconnectSocket();
      };
    }
  }
}, [id, initializeSocket]);
```

## Form Handling

The frontend application uses React Hook Form with Zod for form validation:

### Example: Login Form

```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Form Components

All forms use Shadcn UI form components:
- `Form`: Form wrapper component
- `FormField`: Field container
- `FormLabel`: Accessible label
- `FormMessage`: Error message display
- `Input`: Text input component

## Drag & Drop Implementation

The Kanban board uses @dnd-kit for drag-and-drop functionality:

### Column Reordering

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

<DndContext onDragEnd={handleColumnDragEnd}>
  <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
    {columns.map(column => (
      <SortableColumn key={column._id} column={column} />
    ))}
  </SortableContext>
</DndContext>
```

### Task Movement

Tasks can be dragged between columns and reordered within columns. The implementation handles:
- Drag start/end events
- Column detection
- Order index calculation
- Real-time updates via Socket.io

## API Integration

### Axios Configuration

The API client is configured in `client/src/lib/axios.ts`:

- **Base URL**: Configurable via `VITE_API_BASE_URL`
- **Credentials**: Cookies enabled for authentication
- **Request Interceptor**: Adds JWT token to Authorization header
- **Response Interceptor**: Handles token refresh on 401 errors

### API Structure

API functions are organized by domain:
- `auth.api.ts`: Authentication endpoints
- `folder.api.ts`: Folder endpoints
- `project.api.ts`: Project endpoints
- `column.api.ts`: Column endpoints
- `task.api.ts`: Task endpoints
- `user.api.ts`: User endpoints

### Error Handling

- Automatic token refresh on 401 errors
- Request queuing during token refresh
- Redirect to login on authentication failure
- User-friendly error messages

## Protected Routes

The frontend application uses a `ProtectedRoute` component to guard authenticated routes:

```typescript
<Route
  path={ROUTES.DASHBOARD}
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

**Features:**
- Checks authentication status
- Attempts to restore session on mount
- Redirects to login if not authenticated
- Shows loading state during authentication check

## Testing

### Run Tests

```bash
# Navigate to server directory
cd server

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

Coverage reports are generated in the `server/coverage/` directory. Open `server/coverage/index.html` in your browser to view detailed coverage reports.

## Available Scripts

### Backend Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:ui` | Run tests with Vitest UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run format` | Format code with Prettier |

### Frontend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready application |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## CI/CD

This project uses GitHub Actions for continuous integration. Every push triggers automated tests.

### GitHub Actions Workflow
- **Trigger**: On push and pull requests to any branch
- **Jobs**:
  - Run tests with Node.js 20.x
  - Generate test coverage reports
  - Validate code quality

View workflow file: `.github/workflows/test.yml`

## Development

### Code Style

- TypeScript strict mode enabled (frontend)
- ESLint for code quality
- Prettier for code formatting (via ESLint)
- Consistent component structure

### Best Practices

- **Component Organization**: Components organized by feature/domain
- **Type Safety**: Full TypeScript coverage (frontend)
- **State Management**: Zustand stores for global state (frontend)
- **Form Validation**: Zod schemas (frontend) and Joi schemas (backend) for type-safe validation
- **Error Handling**: Centralized error handling in stores and controllers
- **Loading States**: Loading indicators for async operations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Developed with ❤️ for efficient project management and team collaboration.

