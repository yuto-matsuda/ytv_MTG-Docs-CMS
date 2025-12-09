import DocumentForm from "@/components/DocumentForm";
import { useToast } from "@/components/toast";
import type { OutletContextType } from "@/layouts/DashboardLayout";
import { createDocument, isAdmin } from "@/lib/api";
import { convertDate } from "@/lib/utils";
import { useCallback, useState } from "react";
import { useBeforeUnload, useNavigate, useOutletContext } from "react-router";
import Forbidden from "./Forbidden";

export default function NewDocument() {
  const { user, setDocuments } = useOutletContext<OutletContextType>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [titleError, setTitleError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useBeforeUnload(
    useCallback((e) => {
      if (isSaved) return;
      if (window.confirm() === false) e.preventDefault();  
    }, [isSaved])
  );
  
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setTitleError(false);
    setIsSaved(false);
  }

  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    setIsSaved(false);
  }

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    setDateError(false);
    setIsSaved(false);
  }

  const validateParams = () => {
    if (!title) {
      setTitleError(true);
      return false;
    }
    if (!date) {
      setDateError(true);
      return false;
    }
    return true;
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    const isValid = validateParams();
    if (!isValid) return;

    setIsProcessing(true);

    try {
      const res = await createDocument(title, convertDate(date), body, user.id)
      showToast('ドキュメントを保存しました！', 'success');
      setDocuments((prev) => [...prev, res]);
      setIsSaved(true);
      setTimeout(() => navigate("/dashboard"), 2300);
    } catch (e) {
      showToast('ドキュメントの保存に失敗しました', 'error');
    } finally {
      setIsProcessing(false);
    }
  }

  if (!isAdmin(user)) return <Forbidden />

  return ( 
    <DocumentForm
      heading="新規ドキュメント作成"
      title={title}
      date={date}
      body={body}
      titleError={titleError}
      dateError={dateError}
      isProcessing={isProcessing}
      handleSubmit={handleSubmit}
      handleTitleChange={handleTitleChange}
      handleDateChange={handleDateChange}
      handleBodyChange={handleBodyChange}
    />
  )
}