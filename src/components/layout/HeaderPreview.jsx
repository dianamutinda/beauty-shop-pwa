
import { useState } from 'react';
import {
  Store,
  Search,
  Settings,
  Sun,
  Moon,
} from 'lucide-react';

import Header from './Header.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

export default function HeaderPreview() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">

        <Header
          brandName="Diana Shop"
          logo={
            <div className="flex h-full w-full items-center justify-center bg-interactive-soft text-interactive-primary">
              <Store size={20} />
            </div>
          }
          search={
            <Input
              placeholder="Search products..."
              leftIcon={<Search size={17} />}
              size="md"
            />
          }
          notificationCount={3}
          onNotificationsClick={() => alert('Notifications clicked')}
          user={{
            name: 'Shop Owner',
            avatar: '',
          }}
          onProfileClick={() => alert('Profile clicked')}
          actions={
            <>
              {/* Desktop theme toggle */}
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="
                  hidden sm:flex h-10 w-10
                  items-center justify-center rounded-lg
                  text-text-secondary transition-colors
                  hover:bg-surface hover:text-text-primary
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-interactive-primary
                "
              >
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>

              {/* Desktop settings */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Settings size={18} />
                <span className="hidden lg:inline">Settings</span>
              </Button>
            </>
          }
        />

        <main className="mx-auto max-w-screen-2xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">
                Dashboard
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Preview your shared application header.
              </p>
            </div>

            <span className="rounded-full bg-interactive-soft px-3 py-1 text-xs font-medium text-interactive-primary">
              {darkMode ? 'Dark mode' : 'Light mode'}
            </span>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-surface p-5">
            <h2 className="font-semibold">Preview content</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Check how surfaces, borders and text adapt when switching themes.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
