import Header from '@/components/Header';
import Loading from '@/components/Loading';
import LogoutButton from '@/components/LogoutButton';
import { getAllDocuments, getAllUsers, getMe, getMyImages, isAdmin } from '@/lib/api';
import type { Document, Image, User } from "@/lib/types";
import { sortDocsByDate } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

// WARN: imagesとcashesは有効期限が過ぎると使えなくなる => ログアウトが必要

export interface OutletContextType {
  user: User
  documents: Document[]
  members: User[]
  images: Image[]
  imgCashes: Image[]
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
  setMembers: React.Dispatch<React.SetStateAction<User[]>>
  setImages: React.Dispatch<React.SetStateAction<Image[]>>
  setImgCashes: React.Dispatch<React.SetStateAction<Image[]>>
}

export default function DashboardLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [imgCashes, setImgCashes] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [me, docs] = await Promise.all([
          getMe(),
          getAllDocuments()
        ]);

        let membs: User[] = [];
        let imgs: Image[] = [];
        if (isAdmin(me)) {
          [membs, imgs] = await Promise.all([
            getAllUsers(),
            getMyImages(),
          ]);
        }
        setUser(me);
        setDocuments(sortDocsByDate(docs));
        setMembers(membs);
        setImages(imgs);        
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [])

  if (loading) return <Loading />

  if (error || !user) {
    return (
      <>
        <p>データの取得に失敗しました。再読込み、もしくはログアウトしてください。</p>
        <LogoutButton />
      </>
    )
  }

  return (
    <>
      <Header user={user} docs={documents} />
      <main className="">
        <Outlet context={{ user, documents, members, images, imgCashes, setUser, setDocuments, setMembers, setImages, setImgCashes }} />
      </main>
    </>
  );
}
