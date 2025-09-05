import { useState, useCallback, useRef } from 'react';

export function useResizableSidebar(initialWidth: number, minWidth = 320, maxWidthPercent = 0.8) {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
  const isResizing = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (event: MouseEvent) => {
      if (isResizing.current) {
        const newWidth = event.clientX;
        const maxWidth = window.innerWidth * maxWidthPercent;
        setSidebarWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)));
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [minWidth, maxWidthPercent]);

  return { sidebarWidth, handleMouseDown };
}