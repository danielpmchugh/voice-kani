# Development Workflow

This document outlines the development workflow for the Voice-Kani project.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/danielpmchugh/voice-kani.git
   cd voice-kani
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in the required values.

## Development Scripts

The following scripts are available for development:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ci` - Run tests in CI mode with coverage
- `npm run type-check` - Run TypeScript type checking
- `npm run analyze` - Analyze bundle size
- `npm run clean` - Clean build directories
- `npm run validate` - Run lint, type-check, and tests
- `npm run build:prod` - Clean and build for production

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

1. **Lint**: Runs ESLint to ensure code quality
2. **Test**: Runs Jest tests and generates coverage reports
3. **Build**: Builds the application and analyzes bundle size

The CI/CD pipeline runs on:
- Every push to the `main` branch
- Every pull request targeting the `main` branch

## Performance Monitoring

Bundle analysis is available using:

```bash
npm run analyze
```

This will generate a report showing the size of each bundle and its contents.

## Deployment

The application is deployed to Vercel. The deployment is triggered automatically when changes are pushed to the `main` branch.

## Best Practices

1. Create a feature branch for each new feature or bug fix
2. Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages
3. Ensure all tests pass before submitting a pull request
4. Keep bundle size in check by analyzing the bundle regularly
5. Use TypeScript for type safety
