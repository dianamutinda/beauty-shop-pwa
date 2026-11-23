
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

function SidebarContent() {
  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar brandName="Diana Shop" />

      <main className="min-w-0 flex-1 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Your page content appears here.
        </p>
      </main>
    </div>
  );
}

export default function SidebarPreview() {
  return (
    <BrowserRouter>
      <SidebarContent />
    </BrowserRouter>
  );
}
