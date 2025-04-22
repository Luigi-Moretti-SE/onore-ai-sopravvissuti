import { BrowserRouter, Routes, Route } from "react-router-dom";
import Maps from "./components/maps/Maps";
import { PDFPreview } from "./components/previews/PDFPreview";
import App from "./App";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/map-preview" element={<Maps />} />
        <Route path="/pdf-preview" element={<PDFPreview />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;