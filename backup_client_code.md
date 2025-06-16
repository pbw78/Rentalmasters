# Frontend Code Backup - RentalMaster

## client/src/App.tsx
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import Tenants from "@/pages/Tenants";
import Contracts from "@/pages/Contracts";
import Payments from "@/pages/Payments";
import ServiceRequests from "@/pages/ServiceRequests";
import Reports from "@/pages/Reports";
import Users from "@/pages/Users";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/properties" component={Properties} />
          <Route path="/tenants" component={Tenants} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/payments" component={Payments} />
          <Route path="/service-requests" component={ServiceRequests} />
          <Route path="/reports" component={Reports} />
          <Route path="/users" component={Users} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router />
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
```

## client/src/main.tsx
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## client/src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Main brand colors */
  --primary: 219 70% 53%;
  --primary-foreground: 0 0% 98%;
  --secondary: 220 14.3% 95.9%;
  --secondary-foreground: 220.9 39.3% 11%;
  
  /* Background and surface colors */
  --background: 0 0% 100%;
  --foreground: 224 71.4% 4.1%;
  --muted: 220 14.3% 95.9%;
  --muted-foreground: 220 8.9% 46.1%;
  
  /* Accent colors */
  --accent: 220 14.3% 95.9%;
  --accent-foreground: 220.9 39.3% 11%;
  
  /* Border and input colors */
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 224 71.4% 4.1%;
  
  /* Card colors */
  --card: 0 0% 100%;
  --card-foreground: 224 71.4% 4.1%;
  --popover: 0 0% 100%;
  --popover-foreground: 224 71.4% 4.1%;
  
  /* Destructive colors */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 20% 98%;
  
  /* Chart colors */
  --chart-1: 12 76% 61%;
  --chart-2: 173 58% 39%;
  --chart-3: 197 37% 24%;
  --chart-4: 43 74% 66%;
  --chart-5: 27 87% 67%;
  
  /* Border radius */
  --radius: 0.75rem;
}

.dark {
  --background: 224 71.4% 4.1%;
  --foreground: 210 20% 98%;
  --muted: 215 27.9% 16.9%;
  --muted-foreground: 217.9 10.6% 64.9%;
  --popover: 224 71.4% 4.1%;
  --popover-foreground: 210 20% 98%;
  --card: 224 71.4% 4.1%;
  --card-foreground: 210 20% 98%;
  --border: 215 27.9% 16.9%;
  --input: 215 27.9% 16.9%;
  --primary: 219 70% 53%;
  --primary-foreground: 224 71.4% 4.1%;
  --secondary: 215 27.9% 16.9%;
  --secondary-foreground: 210 20% 98%;
  --accent: 215 27.9% 16.9%;
  --accent-foreground: 210 20% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 20% 98%;
  --ring: 216 12.2% 83.9%;
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

@layer base {
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
  }

  h1 { font-size: 2.25rem; }
  h2 { font-size: 1.875rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
  h5 { font-size: 1.125rem; }
  h6 { font-size: 1rem; }
}

@layer components {
  .btn {
    @apply inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none;
  }

  .btn-sm {
    @apply h-8 px-3 text-xs;
  }

  .btn-md {
    @apply h-9 px-4 py-2;
  }

  .btn-lg {
    @apply h-10 px-8;
  }

  .btn-xl {
    @apply h-12 px-6 text-base;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}

/* Form styles */
.form-label {
  @apply text-sm font-medium text-gray-700 mb-1 block;
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors;
}

.form-textarea {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none;
}

/* Button variants */
.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-gray-300 focus:ring-2 focus:ring-secondary focus:ring-offset-2 transition-colors;
}

.btn-outline {
  @apply border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors;
}

/* Card enhancements */
.property-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1;
}

.stat-card {
  @apply bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300;
}

/* Animation utilities */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Status badges */
.status-available { @apply bg-green-100 text-green-800; }
.status-rented { @apply bg-blue-100 text-blue-800; }
.status-maintenance { @apply bg-yellow-100 text-yellow-800; }
.status-active { @apply bg-green-100 text-green-800; }
.status-expired { @apply bg-red-100 text-red-800; }
.status-pending { @apply bg-yellow-100 text-yellow-800; }
.status-completed { @apply bg-green-100 text-green-800; }
.status-cancelled { @apply bg-gray-100 text-gray-800; }

/* Loading states */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-break {
    page-break-before: always;
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .container {
    @apply px-4;
  }
  
  .grid-responsive {
    @apply grid-cols-1;
  }
}

/* Focus improvements for accessibility */
.focus-visible:focus {
  @apply outline-none ring-2 ring-primary ring-offset-2;
}

/* Custom components */
.sidebar-link {
  @apply flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors;
}

.sidebar-link.active {
  @apply bg-primary text-white hover:bg-blue-700 hover:text-white;
}

/* Table styles */
.table-auto {
  @apply w-full border-collapse;
}

.table-auto th {
  @apply bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200;
}

.table-auto td {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200;
}

.table-auto tr:hover {
  @apply bg-gray-50;
}
```

## client/index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RentalMaster - Property Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```