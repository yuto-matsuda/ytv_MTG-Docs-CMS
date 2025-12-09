import { Modal } from "@/components/Modal";
import { useToast } from "@/components/toast";
import useModal from "@/hooks/useModal";
import type { OutletContextType } from "@/layouts/DashboardLayout";
import { deleteDocumentById, isAdmin } from "@/lib/api";
import type { Document } from "@/lib/types";
import { sortDocsByDate } from "@/lib/utils";
import { Eye, Image, Pencil, Trash, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";

export default function Dashboard() {
  const { user, documents: _docs, members, images, setDocuments: _setDocs, imgCashes } = useOutletContext<OutletContextType>();
  const [documents, setDocuments] = useState<Document[]>(_docs);
  const [isOpen, openModal, closeModal] = useModal();
  const { showToast } = useToast();
console.log(imgCashes)
  const handleDeleteDoc = async (id: string) => {
    try {
      await deleteDocumentById(id);
      _setDocs(documents.filter(doc => doc.id !== id));
      showToast('ドキュメントを削除しました', 'success');
    } catch (error) {
      showToast('ドキュメントの削除に失敗しました', 'error');
    } finally {
      closeModal();
    }
  }

  useEffect(() => {
    setDocuments(sortDocsByDate(_docs));
  }, [_docs]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      {isAdmin(user) && (
        <div className="w-full grid grid-cols-3 gap-4 mb-4">
          <div className="w-full shadow rounded-lg space-y-2 py-4 px-8">
            <p className="text-sm text-base-content/80">ユーザ</p>
            <div className="flex items-center justify-between  px-2">
              <p className="text-2xl font-bold">
                {members.length}
                <span className="text-sm font-normal pl-2">人</span>
              </p>
              <UserIcon size={26} />
            </div>
            <Link
              to='/dashboard/members'
              className="text-sm text-base-content/80 border-b border-base-content/80 px-1 hover:text-secondary/80 hover:border-secondary/80"
            >
              管理・作成
            </Link>
          </div>
          <div className="w-full shadow rounded-lg space-y-2 py-4 px-8">
            <p className="text-sm text-base-content/80">画像</p>
            <div className="flex items-center justify-between  px-2">
              <p className="text-2xl font-bold">
                {images.length}
                <span className="text-sm font-normal pl-2">枚</span>
              </p>
              <Image size={26} />
            </div>
            <Link
              to='/dashboard/images'
              className="text-sm text-base-content/80 border-b border-base-content/80 px-1 hover:text-secondary/80 hover:border-secondary/80"
            >
              管理・アップロード
            </Link>
          </div>
        </div>
      )}
      <div className="w-full shadow rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">ドキュメント一覧</h1>
          {isAdmin(user) && (
            <Link
              to='/dashboard/docs/create'
              className="text-sm text-base-content/80 border-b border-base-content/80 px-1 hover:text-secondary/80 hover:border-secondary/80"
            >
              作成
            </Link>
          )}
        </div>
        <table className="w-full border-collapse">
          <thead className="text-left">
            <tr className="">
              <th className="pl-4">タイトル</th>
              <th>MTG日</th>
              <th>作成者</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, i) => (
              <tr key={doc.id} className={`hover:bg-base-content/10 ${i % 2 === 0 ? "bg-base-content/5" : ""}`}>
                <td className="py-2 pl-4">{doc.title}</td>
                <td className="py-2">{doc.mtg_date}</td>
                <td className="py-2">{doc.author_name}</td>
                <td className="align-middle py-2 pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/dashboard/docs/${doc.id}`} className="hover:text-secondary">
                      <Eye size={18} />
                    </Link>
                    <Link to={`/dashboard/docs/edit/${doc.id}`} className={`${user.id === doc.author_uuid ? "hover:text-success" : "pointer-events-none text-base-content/30"}`}>
                      <Pencil size={18} />
                    </Link>
                    <button onClick={() => openModal(`del_${doc.id}`)} className={`${user.id === doc.author_uuid ? "hover:text-error" : "pointer-events-none text-base-content/30"}`}>
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {documents.map(doc => (
          <Modal key={doc.id} isOpen={isOpen(`del_${doc.id}`)} bgClose={closeModal} className="flex flex-col gap-4 items-center w-xl bg-base-100 rounded-xl p-4">
            <p><span className="font-bold">"{doc.title}"</span>を削除しますか？</p>
            <div className="flex gap-8">
              <button onClick={() => handleDeleteDoc(doc.id)} className="w-24 text-white bg-error rounded-md cursor-pointer py-1 hover:bg-error/70">
                削除
              </button>
              <button onClick={closeModal} className="w-24 text-info-content border-2 border-info rounded-md cursor-pointer py-1 hover:bg-info">
                キャンセル
              </button>
            </div>
          </Modal>
        ))}
      </div>
    </div>
  )
}