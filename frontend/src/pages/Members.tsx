import { Modal, ModalCloseButton } from "@/components/Modal";
import { useToast } from "@/components/toast";
import UserAdminForm from "@/components/UserAdminForm";
import useModal from "@/hooks/useModal";
import type { OutletContextType } from "@/layouts/DashboardLayout";
import { createUser, deleteUserById, isAdmin, updateUserById } from "@/lib/api";
import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import Forbidden from "./Forbidden";

export default function Members() {
  const { user, members, setMembers } = useOutletContext<OutletContextType>();
  const [isOpen, openModal, closeModal] = useModal();
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [role, setRole] = useState<'guest' | 'admin'>('guest');
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateParams('new');
    if (!isValid) return;

    setLoading(true);

    try {
      const { user_uuid } = await createUser(userId, password, username, role);
      setMembers(prev => [...prev, { id: user_uuid, user_id: userId, username, role }]);
      setUserId('');
      setUsername('');
      setPassword('');
      showToast('ユーザを作成しました', 'success');
    } catch (error) {
      console.error(error);
      showToast('ユーザの作成に失敗しました', 'error');
    } finally {
      setLoading(false);
      closeModal();
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValid = validateParams('edit');
    if (!isValid || !editingId) return;

    setLoading(true);

    try {
      await updateUserById(editingId, userId, password, username, role);
      setMembers(prev => prev.map(member => member.id === editingId ? { id: editingId, user_id: userId, username, role } : member));
      setEditingId(null);
      setUserId('');
      setUsername('');
      setPassword('');
      showToast('ユーザを更新しました', 'success');
    } catch (error) {
      console.error(error);
      showToast('ユーザの更新に失敗しました', 'error');
    } finally {
      setLoading(false);
      closeModal();
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUserById(id);
      setMembers(members.filter(member => member.id !== id));
      showToast('ユーザを削除しました', 'success');
    } catch (error) {
      console.error(error);
      showToast('ユーザの削除に失敗しました', 'error');
    } finally {
      closeModal();
    }
  }

  const openCreateModal = () => {
    setUserId('');
    setUsername('');
    setPassword('');
    setRole('guest');
    openModal(`create-user`);
  }

  const openEditModal = (id: string) => {
    const member = members.find(member => member.id === id);
    setEditingId(id);
    setUserId(member!.user_id);
    setUsername(member!.username);
    setRole(member!.role);
    openModal(`edit_${id}`);
  }

  if (!isAdmin(user)) return <Forbidden />

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">ユーザ一覧</h1>
          <button
            onClick={openCreateModal}
            className="text-sm text-base-content/80 border-b border-base-content/80 px-1 hover:text-secondary/80 hover:border-secondary/80"
          >
            作成
          </button>
        </div>
      <table className="w-full border-collapse shadow">
        <thead className="text-left">
          <tr className="">
            <th className="pl-4">ユーザ名</th>
            <th>ユーザID</th>
            <th>ロール</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, i) => (
            <tr key={member.id} className={`hover:bg-base-content/10 ${i % 2 === 0 ? "bg-base-content/5" : ""}`}>
              <td className="py-2 pl-4">{member.username}</td>
              <td className="py-2">{member.user_id}</td>
              <td className="py-2">{member.role}</td>
              <td className="align-middle py-2 pr-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEditModal(member.id)} className="hover:text-success">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => openModal(`del_${member.id}`)} className="hover:text-error">
                    <Trash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {members.map(member => (
        <>
          <Modal isOpen={isOpen(`edit_${member.id}`)} className="flex flex-col gap-4 items-center w-96 bg-base-100 rounded-xl py-4 px-6">
            <ModalCloseButton onClose={closeModal} size="md" top={12} right={12} />
            <h1 className="text-center font-bold text-lg">ユーザ編集</h1>
            <UserAdminForm
              error={error}
              loading={loading}
              userId={userId}
              password={password}
              username={username}
              role={role}
              handleSubmit={handleUpdate}
              handleInputUserId={handleInputUserId}
              handleInputPassword={handleInputPassword}
              handleInputUsername={handleInputUsername}
              handleSelectRole={handleSelectRole}
            />
          </Modal>
          <Modal key={member.id} isOpen={isOpen(`del_${member.id}`)} bgClose={closeModal} className="flex flex-col gap-4 items-center w-xl bg-base-100 rounded-xl p-4">
            <p><span className="font-bold">"{member.username}"</span>を削除しますか？</p>
            <div className="flex gap-8">
              <button onClick={() => handleDelete(member.id)} className="w-24 text-white bg-error rounded-md cursor-pointer py-1 hover:bg-error/70">
                削除
              </button>
              <button onClick={closeModal} className="w-24 text-info-content border-2 border-info rounded-md cursor-pointer py-1 hover:bg-info">
                キャンセル
              </button>
            </div>
          </Modal>
        </>
      ))}
      <Modal isOpen={isOpen('create-user')} className="flex flex-col gap-4 items-center w-96 bg-base-100 rounded-xl py-4 px-6">
        <ModalCloseButton onClose={closeModal} size="md" top={12} right={12} />
        <h1 className="text-center font-bold text-lg">ユーザ作成</h1>
        <UserAdminForm
          isCreate
          error={error}
          loading={loading}
          userId={userId}
          password={password}
          username={username}
          role={role}
          handleSubmit={handleCreate}
          handleInputUserId={handleInputUserId}
          handleInputPassword={handleInputPassword}
          handleInputUsername={handleInputUsername}
          handleSelectRole={handleSelectRole}
        />
      </Modal>
    </div>
  )
}