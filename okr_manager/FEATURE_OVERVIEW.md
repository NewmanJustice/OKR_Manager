# OKR Manager – Feature Overview

## Core Features

### 1. User Authentication & Roles
- Secure login and registration system.
- User roles: Admin, Principal Development Manager (PDM), User.
- Role-based access control for all major features.
- Roles are fully normalized in the database using a Role table and roleId foreign key.
- Session includes isAdmin and isLineManager booleans for robust access checks.

### 2. OKR Management
- Create, view, edit, and delete Objectives and Key Results (OKRs).
- Assign OKRs to users or teams.
- Progress tracking and status updates.
- Principal Development Managers can create, edit, and review success criteria for key results.

### 3. Role Descriptions
- Admins can create, view, and edit Markdown-based descriptions for each user role (e.g., Principal Development Manager).
- Role descriptions are stored in the database and can be managed via an admin UI.
- All role descriptions are listed in the admin panel, with live editing and preview.
- Users can view their own role description in the sidebar/drawer, rendered as Markdown.

### 4. Admin Dashboard
- Centralized dashboard for admin users.
- Links to manage users, OKRs, and role descriptions.
- Overview of system activity and user management tools.

### 5. Responsive UI
- Built with Next.js, Prisma, and MUI Joy UI for a modern, responsive experience.
- Sidebar and navigation components adapt to user role and device size.
- UI is consistent and modern across login, registration, dashboard, and review flows.

### 6. Security & Session Management
- Secure session handling with cookie-based authentication.
- Logout endpoint to clear session cookies.
- API endpoints protected by role-based access checks using normalized session fields.
- All session and user info APIs return normalized fields (roleName, isAdmin, isLineManager).

### 7. Reviews & Progress
- Monthly and quarterly review flows for PDMs, with auto-calculated OKR grading.
- Review forms clear state when switching quarters/years to prevent stale data.

## Technical Stack
- **Frontend:** Next.js (App Router), React, MUI Joy UI
- **Backend:** Next.js API routes, Prisma ORM, SQLite (or other supported DB)
- **Authentication:** Custom session logic with secure cookies
- **Styling:** MUI Joy UI, Emotion (with SSR-safe setup)

## Notable Implementation Details
- All MUI Joy UI and Emotion-dependent components are rendered inside a client boundary to avoid hydration errors.
- Admin-only API endpoints for sensitive operations (e.g., upserting role descriptions).
- Markdown editing and preview for role descriptions using react-markdown.
- Hydration and SSR issues with Emotion are mitigated by isolating all Joy UI code in client components.
- All legacy role string checks have been removed from the codebase.

---

For more details, see the README or individual feature documentation.
