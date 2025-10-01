# Youth Football App

A modern React application for managing youth football teams, built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- **Dashboard**: Overview of team stats, upcoming events, and quick actions
- **Schedule**: Manage practices, games, and training sessions
- **Attendance**: Track player attendance
- **Messages**: Team communication
- **Profile**: User profile management
- **Onboarding**: Multi-step onboarding flow for new users

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components based on Radix UI
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

All dependencies are already installed. If you need to reinstall them:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build

Create a production build:

```bash
npm run build
```

### Preview

Preview the production build:

```bash
npm run preview
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Project Structure

```
youth-football-app/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── Dashboard.tsx   # Dashboard view
│   ├── Schedule.tsx    # Schedule view
│   ├── Attendance.tsx  # Attendance tracking
│   ├── Messages.tsx    # Team messaging
│   ├── Profile.tsx     # User profile
│   └── Onboarding.tsx  # Onboarding flow
├── styles/
│   └── globals.css     # Global styles and Tailwind config
├── App.tsx             # Main app component
├── main.tsx            # App entry point
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration

```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Private project


