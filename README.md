# BlockHyre Monorepo

Welcome to the BlockHyre repository. This project is a monorepo containing both the Web and Mobile applications for the BlockHyre platform.

## Architecture

This project is built using:
- **Monorepo Manager:** [Turborepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Web App:** [Next.js](https://nextjs.org/) (App Router)
- **Mobile App:** [Expo](https://expo.dev/) (React Native)
- **Backend/DB:** [Supabase](https://supabase.com/)

## Project Structure

```text
.
├── apps/
│   ├── web/          # Next.js Web Application
│   └── mobile/       # Expo React Native Mobile App
├── packages/
│   └── database/     # Shared Database Logic (Supabase Client)
├── package.json      # Root configuration
├── pnpm-workspace.yaml
└── turbo.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm

To install pnpm globally:
```bash
npm install -g pnpm
```

### Installation

1. Clone the repository.
2. Install dependencies (from the root):

```bash
pnpm install
```

### Development

You can run both apps simultaneously using the root development script:

```bash
pnpm dev
```

**Filtering:**
To run only a specific app:

```bash
pnpm dev --filter web
```

```bash
pnpm dev --filter mobile
```

## Useful Commands

| Command | Description |
| - | - |
| `pnpm dev` | Starts dev servers for all apps |
| `pnpm build` | Builds all apps |
| `pnpm lint` | Runs linter across the workspace |

## Mobile Development

To properly run the mobile app, ensure you have the Expo Go app installed on your device or an Android/iOS emulator running.

If you encounter issues with the Metro bundler (invalid hook calls, cache issues), use the clear flag:

```bash
pnpm dev --filter mobile -- --clear
```

## Environment Variables

Each app manages its own environment variables.
- **Web:** `apps/web/.env.local`
- **Mobile:** `apps/mobile/.env`

Please ask the project administrator for the required secret keys.

## Contribution

1. Create a new branch for your feature:
```bash
git checkout -b feature/amazing-feature
```

2. Commit your changes:
```bash
git commit -m 'Add some amazing feature'
```

3. Push to the branch:
```bash
git push origin feature/amazing-feature
```

4. Open a Pull Request



