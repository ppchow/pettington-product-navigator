import Layout from '@/components/Layout';

export default function Offline() {
  return (
    <Layout>
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          You are currently offline
        </h2>
        <p className="text-gray-600 mb-8">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </Layout>
  );
}
