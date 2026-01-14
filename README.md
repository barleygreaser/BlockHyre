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
# Run only Web
pnpm dev --filter web
```

```bash
# Run only Mobile
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

| Primary Dashboard Interface | Flight Monitoring & Analytics | Real-Time Telegram Alerts |
| :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/1a6447a7-7d27-47eb-89c1-3cb0f1d9dc66" width="300" /> | <img src="https://github.com/user-attachments/assets/96426c46-a8f9-4a57-b801-78669640abe9" width="300" /> | <img src="https://github.com/user-attachments/assets/87e5434d-00f1-460f-a8c7-a5d5a3b5c1c1" width="300" /> |
| The central command module for configuring route parameters. Seamlessly toggle between departure and arrival nodes, verify scheduled flight dates, and utilize the integrated real-time seat availability validator.^[The dashboard utilizes a reactive UI to ensure seamless route selection.] | A comprehensive overview of active watchlists and historical scanning data. This interface provides granular insights into past search performance and ongoing tracking status.^[The historical tab stores metadata for previous execution cycles.] | Automated notification stream delivering instant updates to your mobile device. Stay informed of critical availability changes through formatted, actionable Telegram alerts.^[Alerts are pushed via the Telegram Bot API upon state change detection.] |

| Calendar Integration & Automated Scheduling |
| :--- |
| <img src="https://github.com/user-attachments/assets/fa3a5f2d-44fd-4c47-b1ed-043802084b90" width="100%" /> |
| **Dynamic Calendar Synchronization** |
| The system features native Google Calendar integration, facilitating the automated management of flight itineraries. By default, the service monitors and synchronizes routes between **Mestia** and **Natakhtari**, proactively populating your calendar with confirmed schedules. The integration is bi-directional and adaptive: it automatically appends new flight instances upon discovery and removes entries if route configurations change or tickets become unavailable, ensuring your personal schedule remains a real-time "source of truth."^[Calendar events are managed via the Google Calendar API OAuth2 flow.] |


