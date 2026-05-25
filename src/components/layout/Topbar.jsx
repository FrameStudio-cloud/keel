import { CiBellOn } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";

export default function Topbar({ title }) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-sm font-medium text-gray-800">{title}</h1>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
          <CiBellOn />
        </button>
        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all">
          <CiSearch />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium cursor-pointer">
          SH
        </div>
      </div>
    </header>
  );
}
