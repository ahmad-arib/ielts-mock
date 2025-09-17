This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Development helpers

### Seed a successful purchase

To quickly work on the post-payment experience you can create a fake successful purchase in Supabase by calling the local API route `POST /api/dev/seed-success`. The route is disabled in production and uses your `SUPABASE_SERVICE_ROLE_KEY`, so ensure the environment variables from `.env.local` are available when running the development server.

The endpoint accepts optional overrides for `email`, `user`, `amount`, and `token`. When no payload is provided it will create a paid record for `mail@ahmadarib.com` and issue a fresh token.

```bash
curl -X POST http://localhost:3000/api/dev/seed-success \
  -H 'Content-Type: application/json' \
  -d '{"email":"mail@ahmadarib.com","user":"ahmadarib"}'
```

The JSON response includes the generated token so you can log in immediately via `/login` and continue building the test pages.
