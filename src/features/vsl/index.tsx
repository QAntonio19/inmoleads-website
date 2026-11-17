// Punto de entrada del módulo. En el router del sitio:
//   const VslRoutes = lazy(() => import("./features/vsl"));
//   <Route path="/sesion/*" element={<VslRoutes />} />

import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { paths, vslConfig } from "./config";
import { initPixel, pageView } from "./lib/tracking";
import LandingPage from "./pages/LandingPage";
import NotYetPage from "./pages/NotYetPage";
import SchedulePage from "./pages/SchedulePage";
import ThanksPage from "./pages/ThanksPage";

// Al cargar el módulo, antes de que cualquier página mande eventos.
initPixel(vslConfig.metaPixelId);

/** Al cambiar de página: subir al inicio y mandar el PageView de Meta. */
function OnRouteChange() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    pageView();
  }, [pathname]);
  return null;
}

/**
 * Mientras se está en /sesion: título propio y «noindex» para que Google no la muestre
 * (se llega desde anuncios). Al salir, se deja todo como estaba en el sitio.
 */
function usePageMeta() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Sesión estratégica · InmoLeads";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, []);
}

export default function VslRoutes() {
  usePageMeta();
  return (
    <>
      <OnRouteChange />
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="agenda" element={<SchedulePage />} />
        <Route path="gracias" element={<ThanksPage />} />
        <Route path="todavia-no" element={<NotYetPage />} />
        <Route path="*" element={<Navigate to={paths.landing} replace />} />
      </Routes>
    </>
  );
}
