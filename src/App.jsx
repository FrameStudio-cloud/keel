import { BrowserRouter, Routes, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Social from "./pages/Social";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/social" element={<Social />} />
      </Routes>
    </BrowserRouter>
  );
}
