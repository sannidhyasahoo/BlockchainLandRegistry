# Clerk Authentication Setup Guide

## Overview
This application uses Clerk for user authentication with custom role-based onboarding. Users can sign up as either a "User" or "Registrar" which determines their access level in the dashboard.

## Setup Instructions

### 1. Create a Clerk Account
1. Go to [https://clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application in the Clerk dashboard

### 2. Get Your Publishable Key
1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Update your `.env` file:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   ```

### 3. Configure Clerk Settings

#### Enable Email/Password Authentication
1. In Clerk dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address** and **Password**

#### Configure Paths (Important!)
1. Go to **Paths** in the Clerk dashboard
2. Set the following paths:
   - **Sign-in URL**: `/sign-in`
   - **Sign-up URL**: `/sign-up`
   - **After sign-in URL**: `/dashboard`
   - **After sign-up URL**: `/onboarding`

#### Enable User Metadata
1. Go to **Customization** → **User Metadata**
2. Ensure **Unsafe Metadata** is enabled (this is where we store the user role)

### 4. Optional: Add Social Login
1. In Clerk dashboard, go to **User & Authentication** → **Social Connections**
2. Enable providers like Google, GitHub, etc.

## How It Works

### Authentication Flow
1. **Landing Page** (`/`) - Public page with "Get Started" button
2. **Sign Up** (`/sign-up`) - Clerk's sign-up form
3. **Onboarding** (`/onboarding`) - Custom role selection page (User or Registrar)
4. **Dashboard** (`/dashboard`) - Protected routes requiring authentication

### Role-Based Access
- **User Role**: Can view properties and verify ownership
- **Registrar Role**: Can mint new properties and manage the registry

The role is stored in Clerk's `unsafeMetadata` and checked throughout the app.

### Protected Routes
The dashboard routes are protected and will:
1. Redirect to `/sign-in` if not authenticated
2. Redirect to `/onboarding` if authenticated but no role selected
3. Show dashboard if authenticated and role is set

## Components Created

- `SignUpPage.jsx` - Clerk sign-up with custom styling
- `SignInPage.jsx` - Clerk sign-in with custom styling
- `OnboardingPage.jsx` - Custom role selection page
- Updated `Hero.jsx` - Smart "Get Started" button
- Updated `LandingNavbar.jsx` - Shows sign-in or user profile
- Updated `Navbar.jsx` - Shows user role and Clerk profile
- Updated `App.jsx` - Protected routes and authentication logic

## Testing

1. Start your dev server: `npm run dev`
2. Visit `http://localhost:5173`
3. Click "Get Started" or "Sign In"
4. Create a new account
5. Select your role (User or Registrar)
6. You'll be redirected to the dashboard

## Customization

### Styling
The Clerk components use custom appearance settings matching your brand colors. You can modify these in:
- `SignUpPage.jsx`
- `SignInPage.jsx`

### Role Options
To add more roles, update:
- `OnboardingPage.jsx` - Add new role cards
- `Navbar.jsx` - Update role display logic
- `App.jsx` - Update role-based routing if needed

## Troubleshooting

### "Missing Publishable Key" Error
- Make sure you've added `VITE_CLERK_PUBLISHABLE_KEY` to your `.env` file
- Restart your dev server after adding the key

### Redirect Loop
- Check that your Clerk dashboard paths match the routes in the app
- Ensure the onboarding page is not protected

### Role Not Saving
- Verify that unsafe metadata is enabled in Clerk dashboard
- Check browser console for errors

## Security Notes

- User roles are stored in `unsafeMetadata` which is readable by the client
- For production, implement server-side role verification
- Consider using Clerk's Organizations feature for more complex role management
- Always verify permissions on the blockchain level as well
