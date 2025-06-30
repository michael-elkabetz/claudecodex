![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Modern UI](https://img.shields.io/badge/🎨_Modern-UI-FF6B6B?style=flat-square&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/🧩_shadcn-ui-000000?style=flat-square&logo=shadcnui&logoColor=white) ![Responsive](https://img.shields.io/badge/📱_Responsive-Design-4ECDC4?style=flat-square&logoColor=white) ![Dark Mode](https://img.shields.io/badge/🌙_Dark-Mode-2C3E50?style=flat-square&logoColor=white)

# ClaudeCodex Frontend

A modern React TypeScript frontend for ClaudeCodex, providing an intuitive interface for AI-powered code generation and GitHub integration.

![Preview](https://img.shields.io/badge/🚀_Live-Preview-E74C3C?style=flat&logoColor=white) ![Interactive](https://img.shields.io/badge/⚡_Interactive-UI-F39C12?style=flat&logoColor=white)

## ✨ Features

![Features](https://img.shields.io/badge/🌟_Features-Rich-9B59B6?style=flat&logoColor=white)

- **🤖 AI Code Generation**: Interactive prompts with real-time code generation
- **🔗 GitHub Integration**: Seamless repository management and deployment
- **🎨 Modern UI**: Beautiful, responsive design with dark/light modes
- **⚡ Fast & Performant**: Built with Vite for lightning-fast development
- **📱 Mobile-First**: Responsive design that works on all devices
- **🧩 Component Library**: Built with shadcn/ui components

## ⚡ Quick Start

### Development

![Development](https://img.shields.io/badge/🛠️_Development-Mode-16A085?style=flat&logoColor=white)

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Open browser
open http://localhost
```

The frontend will be available at `http://localhost`.

### 🐳 Docker Deployment

#### Using Docker Compose (Recommended)

![Docker Compose](https://img.shields.io/badge/🐙_Docker-Compose-0db7ed?style=flat&logo=docker&logoColor=white)

From the project root:

```bash
# Build and run all services including frontend
docker-compose up --build

# Run only frontend service
docker-compose up frontend

# Production deployment
docker-compose up --build -d
```

The frontend service will be available at `http://localhost` (port 80).

#### Individual Docker Container

![Docker Build](https://img.shields.io/badge/🔨_Docker-Build-2496ED?style=flat&logo=docker&logoColor=white)

```bash
# Build the Docker image
docker build -t claudecodex-frontend .

# Run the container
docker run -d -p 80:80 \
  -e VITE_API_URL=http://localhost:3000 \
  -e VITE_GITHUB_CLIENT_ID=your_github_client_id \
  -e VITE_GITHUB_REDIRECT_URI=http://localhost:3001
  claudecodex-frontend
```

### 🔧 Environment Variables

![Environment](https://img.shields.io/badge/⚙️_Environment-Config-E67E22?style=flat&logoColor=white)

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:3001
```

## 🏗️ Architecture

![Architecture](https://img.shields.io/badge/🏗️_Modern-Architecture-E74C3C?style=flat&logoColor=white)

### Tech Stack

![Tech Stack](https://img.shields.io/badge/⚡_Tech-Stack-FF6B6B?style=flat&logoColor=white)

- **Framework**: ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
- **Language**: ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
- **Build Tool**: ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
- **Styling**: ![TailwindCSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
- **Components**: ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white)
- **Icons**: ![Lucide](https://img.shields.io/badge/Lucide-F56565?style=flat-square&logo=lucide&logoColor=white)

### Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Header.tsx      # App header
│   │   ├── Footer.tsx      # App footer
│   │   ├── Hero.tsx        # Landing hero section
│   │   └── PromptForm.tsx  # AI prompt form
│   ├── pages/              # Route pages
│   │   ├── Index.tsx       # Home page
│   │   └── NotFound.tsx    # 404 page
│   ├── config/             # Configuration
│   │   ├── api.ts          # API configuration
│   │   └── github.ts       # GitHub config
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx  # Mobile detection
│   │   └── use-toast.ts    # Toast notifications
│   ├── lib/                # Utility libraries
│   │   └── utils.ts        # Helper functions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
│   ├── logo.png           # App logo
│   ├── favicon.ico        # App favicon
│   └── robots.txt         # SEO robots
├── Dockerfile             # Docker configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind configuration
├── vite.config.ts         # Vite configuration
└── README.md             # You are here
```

## 🎨 UI Components

![UI Components](https://img.shields.io/badge/🧩_UI-Components-9B59B6?style=flat&logoColor=white)

Built with **shadcn/ui** for consistent, accessible, and beautiful components:

### Core Components

![Components](https://img.shields.io/badge/⚙️_Core-Components-3498DB?style=flat&logoColor=white)

- **Forms**: ![Form](https://img.shields.io/badge/Form-4ECDC4?style=flat-square&logoColor=white) ![Input](https://img.shields.io/badge/Input-95A5A6?style=flat-square&logoColor=white) ![Button](https://img.shields.io/badge/Button-E74C3C?style=flat-square&logoColor=white)
- **Navigation**: ![Header](https://img.shields.io/badge/Header-2C3E50?style=flat-square&logoColor=white) ![Breadcrumb](https://img.shields.io/badge/Breadcrumb-16A085?style=flat-square&logoColor=white)
- **Feedback**: ![Toast](https://img.shields.io/badge/Toast-F39C12?style=flat-square&logoColor=white) ![Alert](https://img.shields.io/badge/Alert-E67E22?style=flat-square&logoColor=white) ![Dialog](https://img.shields.io/badge/Dialog-8E44AD?style=flat-square&logoColor=white)
- **Layout**: ![Card](https://img.shields.io/badge/Card-FFFFFF?style=flat-square&logo=card&logoColor=black) ![Separator](https://img.shields.io/badge/Separator-BDC3C7?style=flat-square&logoColor=white)

### Advanced Components

![Advanced](https://img.shields.io/badge/🚀_Advanced-Components-E74C3C?style=flat&logoColor=white)

- **Data Display**: ![Table](https://img.shields.io/badge/Table-27AE60?style=flat-square&logoColor=white) ![Chart](https://img.shields.io/badge/Chart-3498DB?style=flat-square&logoColor=white) ![Badge](https://img.shields.io/badge/Badge-9B59B6?style=flat-square&logoColor=white)
- **Navigation**: ![Tabs](https://img.shields.io/badge/Tabs-E67E22?style=flat-square&logoColor=white) ![Pagination](https://img.shields.io/badge/Pagination-95A5A6?style=flat-square&logoColor=white)
- **Input**: ![Select](https://img.shields.io/badge/Select-F39C12?style=flat-square&logoColor=white) ![Combobox](https://img.shields.io/badge/Combobox-1ABC9C?style=flat-square&logoColor=white) ![DatePicker](https://img.shields.io/badge/DatePicker-E74C3C?style=flat-square&logoColor=white)

## 🚀 Development

### Available Scripts

![Scripts](https://img.shields.io/badge/📜_npm-Scripts-CB3837?style=flat&logo=npm&logoColor=white)

```bash
# Development
npm run dev              # Start development server
npm run dev:host         # Start with network access

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate test coverage

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking

# Component Development
npm run storybook        # Start Storybook
npm run build-storybook  # Build Storybook
```

### 🔧 Development Tools

![Development Tools](https://img.shields.io/badge/🛠️_Dev-Tools-16A085?style=flat&logoColor=white)

- **Hot Reload**: ![Vite HMR](https://img.shields.io/badge/Vite_HMR-646CFF?style=flat-square&logo=vite&logoColor=white)
- **Type Checking**: ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
- **Linting**: ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
- **Formatting**: ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=white)
- **Component Dev**: ![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat-square&logo=storybook&logoColor=white)

### 🧪 Testing

![Testing](https://img.shields.io/badge/🧪_Testing-Suite-E74C3C?style=flat&logoColor=white)

```bash
# Run all tests
npm run test

# Test with UI
npm run test:ui

# Test with coverage
npm run test:coverage

# Component testing
npm run test:components
```

**Testing Stack**:
- **Framework**: ![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
- **Testing Library**: ![React Testing Library](https://img.shields.io/badge/React_Testing_Library-E33332?style=flat-square&logo=testing-library&logoColor=white)
- **E2E**: ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)

## 🎨 Styling & Theming

![Styling](https://img.shields.io/badge/🎨_Styling-System-FF6B6B?style=flat&logoColor=white)

### TailwindCSS Configuration

![Tailwind](https://img.shields.io/badge/🌊_Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... more theme colors
      },
    },
  },
}
```

### Dark Mode Support

![Dark Mode](https://img.shields.io/badge/🌙_Dark-Mode-2C3E50?style=flat&logoColor=white)

- Automatic system preference detection
- Manual toggle with persistence
- Smooth transitions between themes
- All components support both modes

## 📱 Responsive Design

![Responsive](https://img.shields.io/badge/📱_Responsive-Design-4ECDC4?style=flat&logoColor=white)

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly**: Optimized for touch interactions
- **Performance**: Optimized images and lazy loading

## 🚀 Performance

![Performance](https://img.shields.io/badge/⚡_High-Performance-F39C12?style=flat&logoColor=white)

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image compression and lazy loading
- **Bundle Analysis**: Webpack bundle analyzer integration
- **PWA Ready**: Service worker and offline support

### Performance Metrics

![Metrics](https://img.shields.io/badge/📊_Performance-Metrics-3498DB?style=flat&logoColor=white)

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Excellent ratings
- **Bundle Size**: < 500KB gzipped
- **Load Time**: < 2s on 3G networks

## 🚀 Deployment

![Deployment](https://img.shields.io/badge/🚀_Production-Ready-27AE60?style=flat&logoColor=white)

### Build Process

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

### Deployment Platforms

![Platforms](https://img.shields.io/badge/☁️_Deploy-Platforms-9B59B6?style=flat&logoColor=white)

- **Vercel**: ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
- **Netlify**: ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
- **Docker**: ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
- **AWS S3**: ![AWS](https://img.shields.io/badge/AWS_S3-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)

## 🤝 Contributing

![Contributing](https://img.shields.io/badge/🤝_Contributing-Welcome-FF6B6B?style=flat&logoColor=white)

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-ui`)
3. Add your components to Storybook
4. Write tests for new components
5. Ensure all tests pass (`npm run test`)
6. Check TypeScript types (`npm run type-check`)
7. Commit your changes (`git commit -m 'Add amazing UI feature'`)
8. Push to the branch (`git push origin feature/amazing-ui`)
9. Open a Pull Request

### Component Guidelines

![Guidelines](https://img.shields.io/badge/📋_Component-Guidelines-E67E22?style=flat&logoColor=white)

- Follow shadcn/ui patterns
- Include TypeScript types
- Add Storybook stories
- Write unit tests
- Ensure accessibility compliance

## 📄 License

[![License](https://img.shields.io/badge/License-MIT-A569BD?style=for-the-badge&logo=mit&logoColor=white)](../LICENSE)

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

![Built with](https://img.shields.io/badge/Built_with-❤️_and_⚡-FF69B4?style=flat&logoColor=white) ![Powered by](https://img.shields.io/badge/Powered_by-React-61DAFB?style=flat&logo=react&logoColor=black)
