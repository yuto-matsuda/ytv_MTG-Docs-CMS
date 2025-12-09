// import { createContext, useContext, useEffect, useRef, useState } from "react";

// interface PopoverContent {
//   open: boolean
//   setOpen: React.Dispatch<React.SetStateAction<boolean>>
//   triggerRef: React.RefObject<HTMLDivElement | null>
//   contentRef: React.RefObject<HTMLDivElement | null>
// }

// const PopoverContext = createContext<PopoverContent | null>(null);

// export function Popover({
//   children
// }: {
//   children: React.ReactNode
// }) {
//   const [open, setOpen] = useState(false);
//   const triggerRef = useRef<HTMLDivElement>(null);
//   const contentRef = useRef<HTMLDivElement>(null);

//   return (
//     <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
//       <div className="relative inline-block">
//         {children}
//       </div>
//     </PopoverContext.Provider>
//   );
// }

// export function PopoverTrigger({
//   children
// }: {
//   children: React.ReactNode
// }) {
//   const ctx = useContext(PopoverContext);
//   if (!ctx) throw new Error("PopoverTrigger must be used inside a Popover");

//   const { setOpen, triggerRef } = ctx;

//   return (
//     <div
//       ref={triggerRef}
//       onClick={() => setOpen((v) => !v)}
//       className="cursor-pointer inline-block"
//     >
//       {children}
//     </div>
//   );
// }

// export function PopoverContent({
//   children,
//   className = ''
// }: {
//   children: React.ReactNode
//   className?: string
// }) {
//   const ctx = useContext(PopoverContext);
//   if (!ctx) throw new Error("PopoverContent must be used inside a Popover");

//   const { open, triggerRef, contentRef } = ctx;
//   const [style, setStyle] = useState({});

//   // Trigger の真下に位置を合わせる
//   useEffect(() => {
//     if (open && triggerRef.current && contentRef.current) {
//       const rect = triggerRef.current.getBoundingClientRect();
//       setStyle({
//         position: "absolute",
//         top: rect.height + 4, // Trigger のすぐ下に
//         left: 0,
//         zIndex: 50,
//       });
//     }
//   }, [open, triggerRef, contentRef]);

//   if (!open) return null;

//   return (
//     <div ref={contentRef} className={className} style={style}>
//       {children}
//     </div>
//   );
// }
