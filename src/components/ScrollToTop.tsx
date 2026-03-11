
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Added a helper so that each page appears at the top
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;

