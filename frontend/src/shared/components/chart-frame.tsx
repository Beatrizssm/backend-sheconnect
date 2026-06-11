import React, { useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '../lib/cn';

export function ChartFrame({
  children,
  className,
}: {
  children: React.ReactElement;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateSize = () => {
      const { width, height } = node.getBoundingClientRect();
      setIsReady(width > 0 && height > 0);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn('w-full min-w-0', className)}>
      {isReady ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
