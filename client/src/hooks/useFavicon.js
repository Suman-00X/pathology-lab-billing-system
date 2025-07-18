import { useEffect } from 'react';
import { useLab } from './useApiHooks';

const useFavicon = () => {
  const { lab } = useLab();

  useEffect(() => {
    const setFavicon = (iconUrl) => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(link => link.remove());

      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = iconUrl;
      
      // Add to document head
      document.head.appendChild(link);
    };

    const setTitle = (labName) => {
      document.title = labName ? `${labName} - Pathology Lab` : 'Pathology Lab Billing Software';
    };

    if (lab && lab.logo) {
      // Use lab logo as favicon
      const logoUrl = `https://pathology-lab-billing-system.onrender.com${lab.logo}`;
      setFavicon(logoUrl);
    } else {
      // Fallback to default favicon
      setFavicon('/favicon.ico');
    }

    // Update document title
    setTitle(lab?.name);
  }, [lab]);
};

export default useFavicon; 