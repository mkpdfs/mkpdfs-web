# mkpdfs Web

Next.js 14 dashboard for mkpdfs - a PDF generation SaaS platform.

## Features

- Landing page with product info and pricing
- User authentication (Cognito via AWS Amplify)
- Dashboard with usage stats
- Template management
- PDF generation interface
- API key management
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI + CVA
- AWS Amplify (Cognito authentication)
- TanStack React Query

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get the Cognito values from the backend CloudFormation outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name templify-api-dev \
  --query "Stacks[0].Outputs" \
  --profile rocketeast
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

## Deployment

### AWS Amplify

1. Create Amplify app:
```bash
aws amplify create-app \
  --name mkpdfs-web \
  --repository https://github.com/mkpdfs/mkpdfs-web \
  --platform WEB_COMPUTE \
  --profile rocketeast
```

2. Create branches with environment variables:
```bash
aws amplify create-branch \
  --app-id <app-id> \
  --branch-name dev \
  --stage DEVELOPMENT \
  --enable-auto-build \
  --profile rocketeast
```

3. Configure custom domain:
```bash
aws amplify create-domain-association \
  --app-id <app-id> \
  --domain-name mkpdfs.com \
  --sub-domain-settings '[{"prefix": "", "branchName": "main"}]' \
  --profile rocketeast
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register, etc.)
│   ├── (dashboard)/       # Protected dashboard pages
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Base UI components
│   └── layout/            # Layout components
├── hooks/                 # React hooks
├── lib/                   # Utilities (auth, api, etc.)
├── providers/             # React context providers
└── types/                 # TypeScript types
```

## License

Proprietary - All rights reserved.
