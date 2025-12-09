import { useToast } from "@/components/toast";
import type { OutletContextType } from "@/layouts/DashboardLayout";
import { isAdmin, updateUserById } from "@/lib/api";
import { useState } from "react";
import { useOutletContext } from "react-router";

export default function Settings() {
  const { user } = useOutletContext<OutletContextType>();
  const [userId, setUserId] = useState<string>(user.user_id);
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>(user.username);
  const [role, setRole] = useState<'guest' | 'admin'>('guest');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleInputUserId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
    setError(false);
  }

  const handleInputUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setError(false);
  }

  const handleInputPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(false);
  }

  const handleSelectRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as 'guest' | 'admin');
  }

  const validateParams = (mode: 'edit' | 'new') => {
    if (!userId || !username || (mode === 'new' && !password)) {
      setError(true); 
      return false;
    }
    return true;
  }

  const handleUpdate = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const isValid = validateParams('edit');
    if (!isValid) return;

    setLoading(true);

    try {
      await updateUserById(user.id, userId, password, username, role);
      showToast('ユーザ情報を更新しました', 'success');
    } catch (error) {
      console.error(error);
      showToast('ユーザ情報の更新に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-xl font-bold mb-4">ユーザ設定</h1>
      <div className="flex flex-col items-center w-80 border-2 border-base-content rounded-xl p-4 mx-auto">
        {error && <p className="text-error text-xs">すべての項目を入力してください</p>}
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">ユーザID</legend>
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
              defaultValue={userId}
              onChange={(e) => handleInputUserId(e)}
            />
          </label>
        </fieldset>
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">新パスワード</legend>
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
              defaultValue={password}
              onChange={(e) => handleInputPassword(e)}
            />
          </label>
        </fieldset>
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">ユーザ名</legend>
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
              placeholder="User Name"
              defaultValue={username}
              onChange={(e) => handleInputUsername(e)}
            />
          </label>
        </fieldset>
        <fieldset className="fieldset w-full">
          <legend className="fieldset-legend">ロール</legend>
          <select defaultValue={role} className="select" onChange={handleSelectRole} disabled={!isAdmin(user)}>
            <option>guest</option>
            <option>admin</option>
          </select>
        </fieldset>
        <button
          onClick={(e) => handleUpdate(e)}
          disabled={loading}
          className={`
            text-sm font-semibold text-neutral-content rounded-md py-1 px-8 mt-4
            ${loading ? "disabled:bg-neutral/70 cursor-not-allowed" : "bg-neutral hover:bg-neutral/90 cursor-pointer"}
          `}
        >
          更新
        </button>
      </div>
    </div>
  )
}