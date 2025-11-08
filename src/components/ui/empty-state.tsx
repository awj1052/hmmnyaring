/**
 * Empty State 컴포넌트
 */

import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './card';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        {Icon && <Icon className="mb-4 h-16 w-16 text-muted-foreground" />}
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center mb-4">{description}</p>
        )}
        {action}
      </CardContent>
    </Card>
  );
}

