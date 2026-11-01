import { useState } from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900">Forge</span>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </button>
          {searchOpen && (
            <Input
              placeholder="Search files, components, or commands..."
              className="w-64"
            />
          )}
        </div>
      </div>
    </header>
  );
}