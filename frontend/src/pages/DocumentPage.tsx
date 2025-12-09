import { ConvertMarkdown } from "@/components/ConvertMarkdown";
import Loading from "@/components/Loading";
import { getDocumentById } from "@/lib/api";
import type { Document } from "@/lib/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import NotFound from "./NotFound";

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);

      try {
        const res = await getDocumentById(id!);
        setDocument(res);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDocument();
  }, [id]);
  
  if (loading) return <Loading />
  if (error || !document) return <NotFound />

  return (
    <div className="p-6">
      <div className="flex items-end gap-4 border-b border-base-content pb-0.5 mb-4">
        <h1 className="font-bold text-2xl px-2">{document.title}</h1>
        <p>{document.mtg_date.replaceAll('-', '.')}</p>
      </div>
      <div className="px-4">
        <ConvertMarkdown content={document.body} authorId={document.author_id} />
      </div>
    </div>
  )
}