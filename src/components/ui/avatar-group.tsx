import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactElement, ReactNode } from 'react';
import React from 'react';

interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
    max?: number;
    spacing?: number;
    ref?: React.Ref<HTMLDivElement>;
}

interface AvatarChildProps extends HTMLAttributes<HTMLElement> {
    className?: string;
    style?: React.CSSProperties;
}

const AvatarGroup = ({ className, children, max = 1, spacing = 10, ref, ...props }: AvatarGroupProps) => {
    const renderContent = useMemo(() => {
        const avatarItems: ReactElement<AvatarChildProps>[] = [];
        const processChildren = (child: ReactNode) => {
            if (Array.isArray(child)) {
                child.forEach(processChildren);
            } else if (React.isValidElement(child)) {
                avatarItems.push(child as ReactElement<AvatarChildProps>);
            }
        };
        processChildren(children);

        return (
            <>
                {avatarItems.slice(0, max).map((child, index) => (
                    <div
                        key={child.key}
                        className={cn(child.props.className ?? '')}
                        style={{ marginLeft: index === 0 ? 0 : -spacing, ...child.props.style }}
                    >
                        {child}
                    </div>
                ))}

                {avatarItems.length > max && (
                    <div
                        className={cn(
                            'relative flex items-center justify-center rounded-full border-background bg-muted w-8 border',
                            avatarItems[0]?.props.className ?? '',
                        )}
                        style={{ marginLeft: -spacing }}
                    >
                        <p>+{avatarItems.length - max}</p>
                    </div>
                )}
            </>
        );
    }, [children, max, spacing]);

    return (
        <div ref={ref} className={cn('relative flex', className)} {...props}>
            {renderContent}
        </div>
    );
};

AvatarGroup.displayName = 'AvatarGroup';

export { AvatarGroup };
