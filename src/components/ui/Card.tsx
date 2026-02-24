import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Simple Card component with compound components pattern usually, but simple props here as per homework request
interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children }: CardProps) {
    return <div className={cn('px-6 py-4 border-b border-gray-200', className)}>{children}</div>;
}

export function CardContent({ className, children }: CardProps) {
    return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ className, children }: CardProps) {
    return <div className={cn('px-6 py-4 bg-gray-50', className)}>{children}</div>;
}
