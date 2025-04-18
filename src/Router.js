import { BrowserRouter, Routes, Route } from "react-router-dom";
import Maps from "./components/maps/Maps";
import App from "./App";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/map-preview" element={<Maps />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;