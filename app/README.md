# ChurnWatch App

This is the frontend application for ChurnWatch, built with Next.js, Shadcn/UI and React. It provides a modern, responsive interface for customer churn prediction and analysis.

## Prerequisites

- Node.js >= v20 and < v22
- npm or yarn package manager
- Modern web browser

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Create a `.env` file in the app directory with the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
DATABASE_URL="file:./dev.db"
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm run start
# or
yarn start
```

## Testing

Run the test suite:
```bash
npm test
# or
yarn test
```

For watch mode:
```bash
npm run test:watch
# or
yarn test:watch
```

## Project Structure

```
app/
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/           # Utility functions
│   └── styles/        # CSS and styling
├── public/            # Static assets
├── __tests__/         # Test files
└── package.json       # Project dependencies
```

## Key Dependencies

- Next.js: React framework
- React: UI library
- Tailwind CSS: Styling
- Shadcn/UI: UI components
- Axios: HTTP client
- Jest: Testing framework
- TypeScript: Type safety

## Contributing

1. Fork the project and create a new branch for your feature
2. Make your changes
3. Run tests to ensure everything works
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
