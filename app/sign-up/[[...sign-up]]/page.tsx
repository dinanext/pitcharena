import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 dark:from-gray-950 dark:via-black dark:to-gray-900">
      <div className="w-full max-w-md p-6">
        {/* <div className="text-center mb-8">
          <h1 className="text-4xl font-bold neon-text mb-2">PitchArena</h1>
          <p className="text-gray-400">Create your account to get started</p>
        </div> */}
        <SignUp
          
        />
      </div>
    </div>
  );
}
