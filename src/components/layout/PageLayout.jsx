import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PageLayout({
  title,
  children,
  searchQuery,
  setSearchQuery,
  flush,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-0">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          title={title}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        <main className={`flex-1 overflow-y-auto w-full mx-auto ${flush ? "" : "p-5 max-w-[1720px]"}`}>{children}</main>
      </div>
    </div>
  );
}
