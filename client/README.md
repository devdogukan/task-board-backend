# TaskBoard Frontend

React + TypeScript frontend application for the TaskBoard real-time task management system. This is the client-side application that provides a modern, responsive user interface for managing folders, projects, and tasks with real-time collaboration features.

## Features

### Core Features

- **User Authentication**: Secure login and registration with JWT token management
- **Dashboard Overview**: Centralized view showing statistics and folder organization
- **Folder Management**: Create, organize, and manage folders with member collaboration
- **Project Management**: Create projects within folders with detailed information
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

## Tech Stack

### Core Technologies

- **React 18** - UI library for building user interfaces
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Fast build tool and development server
- **React Router v6** - Client-side routing and navigation
- **Zustand** - Lightweight state management library
- **Axios** - HTTP client for API communication
- **Socket.io Client** - Real-time bidirectional communication

### UI & Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality React component library built on Radix UI
- **Lucide React** - Beautiful icon library
- **Tailwind Animate** - Animation utilities for Tailwind CSS

### Form & Validation

- **React Hook Form** - Performant form library with minimal re-renders
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod resolver for React Hook Form

### Drag & Drop

- **@dnd-kit/core** - Modern drag-and-drop toolkit
- **@dnd-kit/sortable** - Sortable components for drag-and-drop
- **@dnd-kit/utilities** - Utility functions for drag-and-drop

## Project Structure

```
task-board-frontend/
├── public/                 # Static assets
├── src/
│   ├── api/               # API client functions
│   │   ├── auth.api.ts
│   │   ├── folder.api.ts
│   │   ├── project.api.ts
│   │   ├── column.api.ts
│   │   ├── task.api.ts
│   │   └── user.api.ts
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn UI components
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   └── scroll-area.tsx
│   │   ├── AddMemberDialog.tsx
│   │   ├── ColumnCard.tsx
│   │   ├── ColumnForm.tsx
│   │   ├── DeleteColumnDialog.tsx
│   │   ├── DeleteFolderDialog.tsx
│   │   ├── DeleteProjectDialog.tsx
│   │   ├── DeleteTaskDialog.tsx
│   │   ├── FolderForm.tsx
│   │   ├── FolderItem.tsx
│   │   ├── Layout.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectItem.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskForm.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/              # Utility functions and configurations
│   │   ├── axios.ts      # Axios instance with interceptors
│   │   ├── constants.ts  # App constants and endpoints
│   │   ├── socket.ts     # Socket.io client setup
│   │   └── utils.ts      # Helper functions
│   ├── pages/            # Page components
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FolderDetail.tsx
│   │   └── ProjectDetail.tsx
│   ├── store/            # Zustand stores
│   │   ├── authStore.ts
│   │   ├── folderStore.ts
│   │   ├── columnStore.ts
│   │   └── taskStore.ts
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── media/                 # Screenshots and demo videos
├── .eslintrc.cjs         # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # TypeScript config for Node.js
└── vite.config.ts        # Vite configuration
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd realtime-task-board-app/task-board-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   
   Create a `.env` file in the `task-board-frontend` directory:
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

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | No | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.io server URL | No | `http://localhost:5000` |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready application |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

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

## State Management

The application uses Zustand for state management with separate stores for different domains:

### Auth Store (`store/authStore.ts`)

Manages user authentication state:
- User information
- Authentication token
- Login/logout/register actions
- Token refresh mechanism
- Persistent storage with Zustand persist middleware

### Folder Store (`store/folderStore.ts`)

Manages folder and project data:
- Folder list
- Projects by folder
- Folder CRUD operations
- Project CRUD operations
- Member management
- Expanded/collapsed folder state

### Column Store (`store/columnStore.ts`)

Manages column data:
- Columns by project
- Column CRUD operations
- Column reordering

### Task Store (`store/taskStore.ts`)

Manages task data and Socket.io integration:
- Tasks by project
- Task CRUD operations
- Task movement between columns
- Socket.io event listeners
- Real-time updates synchronization

## Socket.io Integration

### Connection Setup

The Socket.io client is initialized in `src/lib/socket.ts`:

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

### Socket Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task:join-project` | `{ projectId: string }` | Join project room for real-time updates |
| `task:leave-project` | `{ projectId: string }` | Leave project room |
| `task:create` | `{ projectId, taskData }` | Create task (emits to room) |
| `task:update` | `{ taskId, updates }` | Update task (emits to room) |
| `task:delete` | `{ taskId, projectId }` | Delete task (emits to room) |
| `task:move` | `{ taskId, newColumnId, orderIndex }` | Move task (emits to room) |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `task:created` | `{ task }` | Task created event |
| `task:updated` | `{ task }` | Task updated event |
| `task:deleted` | `{ taskId, projectId }` | Task deleted event |
| `task:moved` | `{ task, oldColumnId, newColumnId }` | Task moved event |
| `task:error` | `{ error: string }` | Error event |

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

The application uses React Hook Form with Zod for form validation:

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

The API client is configured in `src/lib/axios.ts`:

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

The application uses a `ProtectedRoute` component to guard authenticated routes:

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

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting (via ESLint)
- Consistent component structure

### Best Practices

- **Component Organization**: Components organized by feature/domain
- **Type Safety**: Full TypeScript coverage
- **State Management**: Zustand stores for global state
- **Form Validation**: Zod schemas for type-safe validation
- **Error Handling**: Centralized error handling in stores
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