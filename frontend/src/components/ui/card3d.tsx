import * as React from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card with 3D tilt on hover and lift effect.
 * Uses mouse position for dynamic rotateX/rotateY.
 */
export const Card3D = React.forwardRef<HTMLDivElement, Card3DProps>(
  ({ children, className, ...props }, ref) => {
    const motionRef = React.useRef<HTMLDivElement>(null);
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!motionRef.current) return;
      const rect = motionRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      rotateX.set(-y * 8);
      rotateY.set(x * 8);
    };

    const handleMouseLeave = () => {
      rotateX.set(0);
      rotateY.set(0);
    };

    return (
      <div
        ref={ref}
        className={cn('perspective-[1000px]', className)}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          ref={motionRef}
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1000,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 },
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card
            className="transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)]"
            {...props}
          >
            {children}
          </Card>
        </motion.div>
      </div>
    );
  }
);
Card3D.displayName = 'Card3D';
