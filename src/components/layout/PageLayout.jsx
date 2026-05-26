import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PageLayout({
  title,
  children,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          title={title}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
