import DocumentForm from "@/components/DocumentForm";
import Loading from "@/components/Loading";
import { useToast } from "@/components/toast";
import type { OutletContextType } from "@/layouts/DashboardLayout";
import { getDocumentById, isAdmin, updateDocumentById } from "@/lib/api";
import { convertDate } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useBeforeUnload, useOutletContext, useParams } from "react-router";
import Forbidden from "./Forbidden";
import NotFound from "./NotFound";

export default function EditDocument() {
  const { id } = useParams<{ id: string }>();
  const { user, setDocuments } = useOutletContext<OutletContextType>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [titleError, setTitleError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { showToast } = useToast();

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
      const res = await updateDocumentById(id!, title, convertDate(date), body, user.id);
      showToast('変更を保存しました！', 'success');
      setDocuments((prev) => prev.map(doc => doc.id === res.id ? res : doc));
      setIsSaved(true);
    } catch (e) {
      showToast('変更の保存に失敗しました', 'error');
    } finally {
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);

      try {
        const res = await getDocumentById(id!);
        setTitle(res.title);
        setDate(new Date(res.mtg_date));
        setBody(res.body)
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, []);

  if (!isAdmin(user)) return <Forbidden />
  if (loading) return <Loading />
  if (error)   return <NotFound />

  return (
    <DocumentForm 
      heading="ドキュメント編集"
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