export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold neon-text mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <a href="/" className="text-primary hover:underline">
          Return home
        </a>
      </div>
    </div>
  );
}
