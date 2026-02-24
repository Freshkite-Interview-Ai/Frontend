import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  titleClassName = '',
  descriptionClassName = '',
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white ${titleClassName}`}>{title}</h1>
          {description && (
            <p className={`mt-1 text-secondary-600 dark:text-secondary-400 ${descriptionClassName}`}>{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
