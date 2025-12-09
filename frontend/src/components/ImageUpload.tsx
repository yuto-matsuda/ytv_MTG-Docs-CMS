import { useToast } from "@/components/toast";
import { uploadImages } from "@/lib/api";
import type { Image, User } from "@/lib/types";
import { getDuplicateIndices } from "@/lib/utils";
import { ImageUp } from "lucide-react";
import { useRef, useState } from "react";

export default function ImageUpload({
  user,
  setImages,
  closeModal,
}: {
  user: User
  setImages: React.Dispatch<React.SetStateAction<Image[]>>
  closeModal: () => void
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const dropRef = useRef<HTMLDivElement | null>(null);

  const addFiles = (selected: File[]) => {
    if (selected.length === 0) return;

    const newFiles = [...files, ...selected];
    const newNames = [...names, ...selected.map((file) => file.name)];
    setFiles(newFiles);
    setNames(newNames);
    setConflicts(getDuplicateIndices(newNames));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    addFiles(selected);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...names];
    newNames[index] = name;
    setNames(newNames);
    setConflicts(getDuplicateIndices(newNames));
  };

  const handleFileDelete = (index: number) => {
    const newFiles = files.filter((_, i) => index !== i);
    const newNames = names.filter((_, i) => index !== i);
    setFiles(newFiles);
    setNames(newNames);
    setConflicts(getDuplicateIndices(newNames));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || conflicts.length > 0) return;

    setLoading(true);

    const formData = new FormData();
    files.map((file) => formData.append("files[]", file));
    names.map((name) => formData.append("names[]", name));
    formData.append("userId", user.user_id);

    try {
      const res = await uploadImages(formData);
      setFiles([]);
      setNames([]);
      setImages(prev => [...res, ...prev]);
      showToast('画像をアップロードしました', 'success');
    } catch (error) {
      console.error(error);
      showToast('画像のアップロードに失敗しました', 'error');
    } finally {
      setLoading(false);
      closeModal();
    }    
  };

  return (
    <>
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => dropRef.current?.querySelector("input")?.click()}
        className="flex flex-col items-center gap-2 text-info border-2 border-dashed border-info rounded-xl cursor-pointer p-8 mb-4"
      >
        <ImageUp size={32} />
        <p className="text-lg font-bold">Drag & Drop</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
      {conflicts.length > 0 && (
        <p className="text-error mb-2">名前の競合を解消してください</p>
      )}
      <div className="flex items-center flex-wrap gap-4">      
        {files.map((file, i) => (
          <div key={i} className="relative w-[100px] h-20">
            <img
              src={URL.createObjectURL(file)}
              className={`
                w-full h-full object-cover rounded-lg cursor-pointer
                ${conflicts.includes(i) ? "border-4 border-error" : "border border-base-content"}
              `}
            />
            <div key={i} className="absolute inset-0 bg-black/20 rounded-lg flex flex-col justify-between p-1">
              <button onClick={() => handleFileDelete(i)} className="self-end text-white text-xs bg-black/60 rounded-full w-4 h-4 flex items-center justify-center">✕</button>
              <input
                type="text"
                value={names[i] || ""}
                placeholder="ファイル名"
                onChange={(e) => handleNameChange(i, e.target.value)}
                autoFocus
                className="w-full text-xs p-1 rounded bg-white/60"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || conflicts.length > 0 || files.length === 0}
          className={`
            text-sm font-semibold text-neutral-content rounded-md py-1 px-4 mt-4
            ${loading || conflicts.length > 0 || files.length === 0 ? "disabled:bg-neutral/70 cursor-not-allowed" : "bg-neutral hover:bg-neutral/90 cursor-pointer"}
          `}
        >
          アップロード
        </button>
      </div>
    </>
  );
}
