'use client';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading prospect data...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="card p-8 text-center max-w-md">
        <div className="text-red-500 text-3xl mb-3">!</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to load data</h3>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
