import useModal from "@/hooks/useModal";
import type { Document, User } from "@/lib/types";
import { Link } from "react-router";
import Sidebar from "./Sidebar";

export default function Header({
  user,
  docs,
}: {
  user: User
  docs: Document[]
}) {
  const [isOpen, openModal, closeSidebar] = useModal();
  const openSidebar = () => openModal('sidebar')

  return (
    <>
      <header className="sticky top-0 z-30 bg-base-100/90 h-16 w-full backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <HamburgerButton onClick={openSidebar} />
            <Link to='/dashboard'>
              <h1 className="text-2xl font-semibold text-base-content">読売テレビ共同研究 MTG資料</h1>
            </Link>
          </div>
        </div>
      </header>
      <Sidebar user={user} docs={docs} isOpen={isOpen('sidebar')} onClose={closeSidebar} />
    </>
  )
}

function HamburgerButton({
  onClick
}: {
  onClick: () => void
}) {
  return (
      <svg
        onClick={onClick}
        className="swap-off fill-current cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 512 512"
      >
        <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
      </svg>
      /* <svg
        className="swap-on fill-current"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 512 512">
        <polygon
          points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
      </svg>
     */
  )
}