"use client";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-bold text-gray-900">エラーが発生しました</h2>
      <p className="mt-2 text-gray-500">認証処理中にエラーが発生しました。</p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        再試行
      </button>
    </div>
  );
}
