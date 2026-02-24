import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  PENDING_MANAGER: { label: 'Pending Manager', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  PENDING_LEGAL: { label: 'Pending Legal', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  PENDING_LAWYER: { label: 'Pending Lawyer', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  PENDING_CEO: { label: 'Pending CEO', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  IN_REVIEW: { label: 'In Review', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ASSIGNED: { label: 'Assigned', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  HEARING: { label: 'Hearing', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  SUBMITTED: { label: 'Submitted', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  CLASSIFIED: { label: 'Classified', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  OPINION_PROVIDED: { label: 'Opinion Provided', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  ACTIVE: { label: 'Active', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  DECIDED: { label: 'Decided', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  ARCHIVED: { label: 'Archived', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  EXPIRED: { label: 'Expired', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  TERMINATED: { label: 'Terminated', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  COMMITTEE_REVIEW: { label: 'Committee Review', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  APPEAL: { label: 'Appeal', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  PARTIAL: { label: 'Partial', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
  LOW: { label: 'Low', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  MEDIUM: { label: 'Medium', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  HIGH: { label: 'High', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  CRITICAL: { label: 'Critical', className: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {config.label}
    </span>
  );
}
