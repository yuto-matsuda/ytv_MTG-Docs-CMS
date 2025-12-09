import { useAuth } from "./AuthProvider";

export default function LogoutButton() {
  const { signOut } = useAuth();

  return (
    <button onClick={signOut} className="text-sm text-error cursor-pointer rounded-md py-0.5 px-1 hover:bg-base-300">ログアウト</button>
  )
}