import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { PDFPreview } from "./components/previews/PDFPreview";
import App from "./App";

const Router = () => {
  // Use HashRouter for GitHub Pages deployment to handle client-side routing properly
  const RouterComponent = window.location.hostname === 'localhost' 
    ? BrowserRouter 
    : HashRouter;
    
  return (
    <RouterComponent>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pdf-preview" element={<PDFPreview />} />
      </Routes>
    </RouterComponent>
  );
};

export default Router;