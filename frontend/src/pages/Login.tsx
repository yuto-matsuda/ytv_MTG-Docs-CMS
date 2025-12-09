import { useAuth } from "@/components/AuthProvider";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setError(false);
  }

  const handleInputPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(false);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (error) return;
    
    setIsLoading(true);

    const success = await signIn(userId, password);

    if (success) {
      setTimeout(() => navigate('/dashboard', { replace: true }), 100);
    } else {
      setError(true);
    }

    setIsLoading(false);
  }

  return (
    <div className="flex items-center justify-center w-full h-screen">
      <div className="w-96 border border-base-content/50 rounded-xl">
        <div className="py-4 px-6">
          <h1 className="text-center font-bold text-lg mb-2">ログイン</h1>
          <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col items-center">
            {error && <p className="text-error text-xs">ログインに失敗しました</p>}
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">User ID</legend>
              <label className="input">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </g>
                </svg>
                <input
                  type="text"
                  placeholder="User ID"
                  onChange={(e) => handleInputUserId(e)}
                />
              </label>
            </fieldset>
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">Password</legend>
              <label className="input">
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"
                    ></path>
                    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>
                  </g>
                </svg>
                <input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => handleInputPassword(e)}
                />
              </label>
            </fieldset>
            <button
              type="submit"
              disabled={isLoading}
              className={`
                text-sm font-semibold text-neutral-content rounded-md py-1 px-6 mt-4
                ${isLoading ? "disabled:bg-neutral/70 cursor-not-allowed" : "bg-neutral hover:bg-neutral/90 cursor-pointer"}
              `}
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}