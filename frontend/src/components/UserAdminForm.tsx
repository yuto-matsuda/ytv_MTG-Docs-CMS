export default function UserAdminForm({
  isCreate = false,
  error,
  loading,
  userId,
  password,
  username,
  role,
  handleSubmit,
  handleInputUserId,
  handleInputPassword,
  handleInputUsername,
  handleSelectRole,
}: {
  isCreate?: boolean
  error: boolean
  loading: boolean
  userId: string
  password: string
  username: string
  role: 'guest' | 'admin'
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  handleInputUserId: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleInputPassword: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleInputUsername: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSelectRole: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col items-center w-full">
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
        <legend className="fieldset-legend">{isCreate ? 'パスワード' : '新パスワード'}</legend>
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
        <select defaultValue={role} className="select" onChange={handleSelectRole}>
          <option>guest</option>
          <option>admin</option>
        </select>
      </fieldset>
      <button
        type="submit"
        disabled={loading}
        className={`
          text-sm font-semibold text-neutral-content rounded-md py-1 px-8 mt-4
          ${loading ? "disabled:bg-neutral/70 cursor-not-allowed" : "bg-neutral hover:bg-neutral/90 cursor-pointer"}
        `}
      >
        {isCreate ? '作成' : '更新'}
      </button>
    </form>
  )
}