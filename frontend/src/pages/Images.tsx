import ImageUpload from "@/components/ImageUpload";
import { Modal, ModalCloseButton } from "@/components/Modal";
import { useToast } from "@/components/toast";
import useModal from "@/hooks/useModal";
import type { OutletContextType } from "@/layouts/DashboardLayout";
import { deleteImageById, updateImageNameById } from "@/lib/api";
import { getImageName } from "@/lib/utils";
import { Image as ImageIcon, Trash } from "lucide-react";
import React, { useState } from "react";
import { useOutletContext } from "react-router";

export default function Images() {
  const { user, images, setImages } = useOutletContext<OutletContextType>();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, openModal, closeModal] = useModal();
  const { showToast } = useToast();

  const openEditModal = (id: string) => {
    const image = images.find(img => img.id === id);
    setName(getImageName(image!.path));
    openModal(`edit_${id}`);
  }

  const openDeleteModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
    e.stopPropagation();
    openModal(`del_${id}`);
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) => {
    e.preventDefault();
    if (name === '') return;

    setLoading(true);

    try {
      const res = await updateImageNameById(id, name);
      setImages(prev => prev.map(img => img.id === id ? { id, path: res.path, url: res.url } : img));
      setName('');
      showToast('名前を変更しました', 'success');
    } catch (error) {
      console.error(error);
      showToast('名前の変更に失敗しました', 'error');
    } finally {
      setLoading(false);
      closeModal();
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteImageById(id);
      setImages(prev => prev.filter(img => img.id !== id));
      showToast('画像を削除しました', 'success');
    } catch (error) {
      console.error(error);
      showToast('画像の削除に失敗しました', 'error');
    } finally {
      closeModal();
    }
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">画像一覧</h1>
          <button type="button" onClick={() => openModal('image-upload')} className="flex items-center gap-2 text-white font-bold bg-info rounded-md cursor-pointer py-1 px-2 hover:bg-info/80">
            <ImageIcon size={16} />
            <span className="text-sm">アップロード</span>
          </button>
        </div>
        {images.length === 0 && (
          <p className="font-bold">No Images</p>
        )}
        <div className="grid grid-cols-5 gap-2">
          {images.map(img => (
            <div key={img.id} className="relative h-40 group">
              <div className="w-full h-full overflow-hidden rounded-lg cursor-pointer border border-base-content group-hover:border-primary">
                <img
                  src={img.url}
                  className="w-full h-full object-cover group-hover:scale-110 transform transition-transform duration-300"
                />
              </div>
              <div 
                key={img.id}
                onClick={() => openEditModal(img.id)}
                className="absolute inset-0 rounded-lg flex flex-col justify-between cursor-pointer p-2"
              >
                <button
                  onClick={(e) => openDeleteModal(e, img.id)}
                  className="
                    self-end text-xs rounded-full w-6 h-6 flex items-center justify-center cursor-pointer
                    text-white bg-black/60 hover:text-error hover:bg-white/60
                  "
                >
                  <Trash size={16} />
                </button>
                <p className="w-full text-white text-xs text-center text-ellipsis whitespace-nowrap overflow-hidden bg-black/40 rounded p-1">{getImageName(img.path)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isOpen('image-upload')} className="max-w-4xl w-9/12 bg-base-100 rounded-lg p-8">
        <ModalCloseButton onClose={closeModal} size="md" top={4} right={4} />
        <ImageUpload user={user} setImages={setImages} closeModal={closeModal} />
      </Modal>
      {images.map(img => (
        <React.Fragment key={img.id}>
          <Modal isOpen={isOpen(`edit_${img.id}`)} bgClose={closeModal} className="flex flex-col gap-4 items-center max-w-9/12 w-4xl bg-base-100 rounded-xl py-4 px-6">
            <ModalCloseButton onClose={closeModal} size="md" top={12} right={12} />
            <h1 className="text-center font-bold text-lg">{getImageName(img.path)}</h1>
            <img
              src={img.url}
              className="w-full h-full object-cover border border-base-content rounded-xl mb-2"
            />
            <div className="flex flex-col items-center w-full">
              {name === '' && <p className="text-error text-xs">ファイル名を入力してください</p>}
              <fieldset className="fieldset w-full max-w-lg">
                <legend className="fieldset-legend">ファイル名</legend>
                <label className="input w-full">
                  <input
                    type="text"
                    placeholder="File Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              </fieldset>
              <button
                disabled={loading}
                onClick={(e) => handleSubmit(e, img.id)}
                className={`
                  text-sm font-semibold text-neutral-content rounded-md py-1 px-8 mt-4
                  ${loading ? "disabled:bg-neutral/70 cursor-not-allowed" : "bg-neutral hover:bg-neutral/90 cursor-pointer"}
                `}
              >
                更新
              </button>
            </div>
          </Modal>
          <Modal isOpen={isOpen(`del_${img.id}`)} bgClose={closeModal} className="flex flex-col gap-4 items-center w-xl bg-base-100 rounded-xl p-4">
            <p><span className="font-bold">"{getImageName(img.path)}"</span>を削除しますか？</p>
            <div className="flex gap-8">
              <button onClick={() => handleDelete(img.id)} className="w-24 text-white bg-error rounded-md cursor-pointer py-1 hover:bg-error/70">
                削除
              </button>
              <button onClick={closeModal} className="w-24 text-info-content border-2 border-info rounded-md cursor-pointer py-1 hover:bg-info">
                キャンセル
              </button>
            </div>
          </Modal>
        </React.Fragment>
      ))}
    </>
  );
}
