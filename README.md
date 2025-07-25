# Stock Management Frontend

A modern React TypeScript frontend for the Stock Management System.

## Overview

This frontend application provides a user interface for the Stock Management backend API. It allows users to manage stock items, track transactions, and manage user access control.

## Features

- User authentication and role-based access control
- Dashboard with key statistics and recent transactions
- User management (CRUD operations)
- Region management
- Supply management with regional pricing
- Transaction management and reporting
- Assets management (preview)

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v8 or later)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock.frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:8080/api/v2
```

### Running the Application

```bash
npm start
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
npm run build:prod
```

The production-ready files will be available in the `build` directory.

## Project Structure

```
├── public/                # Static files
├── scripts/               # Utility scripts
├── src/                   # Source code
│   ├── auth/              # Authentication related code
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── store/             # Redux store
│   ├── types/             # TypeScript types and interfaces
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   ├── index.tsx          # Entry point
│   └── index.css          # Global styles
└── tsconfig.json          # TypeScript configuration
```

## Development Scripts

- `npm start` - Start development server
- `npm run build` - Build the application
- `npm run build:prod` - Build for production with optimizations
- `npm run test` - Run tests
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix linting errors
- `npm run typecheck` - Check TypeScript types
- `npm run format` - Format code with Prettier

## Utility Scripts

The project includes utility scripts to help with development:

- `scripts/convert-to-typescript.ps1` - Convert JSX files to TypeScript
- `scripts/create-component.ps1` - Create a new TypeScript component

Example usage:
```powershell
# Convert JSX files to TypeScript
.\scripts\convert-to-typescript.ps1

# Create a new component
.\scripts\create-component.ps1 -ComponentName Button -ComponentType functional -Directory components
```

## Contributing

1. Follow the established code style and patterns
2. Use TypeScript for all new components
3. Use the component creation script for new components
4. Write tests for new features
5. Update documentation as needed

## License

This project is licensed under the MIT License.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
