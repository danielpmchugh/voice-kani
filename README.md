# Voice-Enabled WaniKani Review System

A voice-enabled review system for WaniKani that allows users to practice Japanese language learning through voice input and provides enhanced progress tracking.

## Features

- Voice input for WaniKani reviews
- Enhanced results dashboard
- Real-time progress tracking
- SRS integration

## Prerequisites

- Node.js v18 or later
- npm or yarn
- WaniKani API key (get it from your [WaniKani account settings](https://www.wanikani.com/settings/personal_access_tokens))

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/danielpmchugh/voice-kani.git
   cd voice-kani
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following content:

   ```env
   WANIKANI_API_KEY=your_api_key_here
   WANIKANI_API_VERSION=20230710
   NEXT_PUBLIC_API_URL=https://api.wanikani.com/v2
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure

```
voice-kani/
├── src/               # Source code
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Utility functions
│   ├── types/        # TypeScript definitions
│   ├── services/     # API integrations
│   └── styles/       # Global styles
├── public/           # Static files
├── tests/            # Test files
└── docs/             # Documentation
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- Jest and React Testing Library for testing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Please format your commit messages accordingly:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
