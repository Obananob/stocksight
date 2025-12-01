# StockSight - Real-Time Inventory & Sales Tracking

StockSight is a modern, mobile-first inventory and sales tracking system designed for small shop owners. It enables real-time tracking of sales and inventory, low stock alerts, and provides a simplified interface for field staff.

![StockSight](https://img.shields.io/badge/StockSight-Inventory%20Management-2ECC71?style=for-the-badge)

## Features

- **Real-Time Dashboard** - Live sales metrics, stock levels, and alerts
- **Inventory Management** - Full CRUD operations with categories and search
- **Sales Recording** - Simplified flow optimized for mobile use
- **Role-Based Access** - Owner and Sales Rep roles with different permissions
- **Multi-Currency Support** - NGN, USD, EUR, INR, GHS
- **Multi-Language Support** - English, Hausa, Igbo, Yoruba
- **Profit Tracking** - Per-product and per-sale profit margins
- **Low Stock Alerts** - Automated notifications when stock is low
- **Audit Logging** - Immutable append-only logs for all actions
- **PWA Support** - Install as mobile app, works offline
- **Reconciliation** - Daily cash reconciliation for accountability

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **PWA**: vite-plugin-pwa with service workers

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn or bun
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stocksight.git
   cd stocksight
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

### Database Setup

If you're setting up your own Supabase project:

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migrations in the `supabase/migrations` folder in order
3. Enable Row Level Security (RLS) on all tables
4. Configure authentication settings

## Project Structure

```
stocksight/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts (Settings, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # External service integrations
│   │   └── supabase/    # Supabase client & types
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles & design tokens
├── supabase/
│   ├── config.toml      # Supabase configuration
│   └── migrations/      # Database migrations
└── vite.config.ts       # Vite configuration
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/stocksight)

### Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy!

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/stocksight)

### Other Platforms

StockSight can be deployed to any platform that supports static site hosting:

- **Cloudflare Pages**
- **GitHub Pages**
- **AWS Amplify**
- **Firebase Hosting**
- **Railway**
- **Render**

Build the project with `npm run build` and deploy the `dist` folder.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## User Roles

### Owner
- Full access to all features
- Dashboard with analytics
- Inventory management (CRUD)
- Reports and reconciliation
- Audit log access
- Team management

### Sales Rep
- Record sales
- View inventory (read-only stock levels)
- Personal profile management

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ using [Lovable](https://lovable.dev)
