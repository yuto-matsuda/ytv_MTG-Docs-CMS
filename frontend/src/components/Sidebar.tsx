import type { Document, User } from "@/lib/types";
import { sortDocsByDate } from "@/lib/utils";
import { BookOpen, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthProvider";

export default function Sidebar({
  user,
  docs,
  isOpen,
  onClose,
  className = '',
}: {
  user: User
  docs: Document[]
  isOpen: boolean
  onClose: () => void | undefined
  className?: string
}) {
  const { username, role } = user;
  const [documents, setDocuments] = useState<Document[]>(docs);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (to: string) => {
    navigate(to);
    onClose();
  }

  useEffect(() => {
    setDocuments(sortDocsByDate(docs));
  }, [docs]);

  return (
    <div
      className={`
        fixed inset-0 z-40 bg-black/50 transition-opacity duration-500
        ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
      onClick={onClose}
    >
      <div
        className={`
          fixed left-0 top-0 h-full w-80 bg-base-100 shadow-xl
          transform transition-transform duration-500 ease-[cubic-bezier(0.25,1.25,0.5,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-fit text-sm text-base-100 font-bold rounded-md py-0.5 px-2 ${role === 'admin' ? "bg-secondary" : "bg-info"}`}>
                {username[0]}
              </div>
              <span className="text-md font-bold">{username}</span>
            </div>
            <p className="text-sm font-semibold px-1">{role}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-secondary" />
              <h2 className="text-md font-semibold">MTG資料</h2>
            </div>
            <ul className="max-h-1/2 overflow-auto">
              {documents.map(doc => (
                <li key={doc.id} onClick={() => handleNavigate(`/dashboard/docs/${doc.id}`)} className="flex justify-between items-center gap-2 text-md rounded-md cursor-pointer hover:bg-base-300 py-0.5 px-2">
                  <h3 className="w-3/4 text-ellipsis overflow-hidden">{doc.title}</h3>
                  <span className="w-1/4 text-xs text-right">{doc.mtg_date}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-neutral" />
              <h2 className="text-md font-semibold">設定</h2>
            </div>
            <ul>
              <li onClick={() => handleNavigate('/dashboard/settings')} className="flex items-center gap-1 text-md rounded-md cursor-pointer hover:bg-base-300 py-0.5 px-2">
                <UserIcon size={14} />
                <h3>ユーザ設定</h3>
              </li>
              <li onClick={signOut} className="flex items-center gap-1 text-error text-md rounded-md cursor-pointer hover:bg-base-300 py-0.5 px-2">
                <LogOut size={14} />
                <h3>ログアウト</h3>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}