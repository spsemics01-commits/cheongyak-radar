"use client";

export function Skeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse space-y-3 border border-gray-100 dark:border-gray-700">
      <div className="flex gap-2">
        <div className="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded-full" />
        <div className="h-4 w-12 bg-gray-100 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-600 rounded" />
      <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700 rounded" />
    </div>
  );
}
