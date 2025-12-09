import React, { createContext, useContext, useEffect, useState } from "react";

interface TabsState {
  [groupId: string]: number;
}

interface TabsContextType {
  state: TabsState;
  setActiveTab: (groupId: string, tabId: number) => void;
}

interface GroupContextType {
  groupId: string;
}

interface ItemContextType {
  tabId: number;
  setTabId: React.Dispatch<React.SetStateAction<number>>;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);
const GroupContext = createContext<GroupContextType | undefined>(undefined);
const ItemContext = createContext<ItemContextType | undefined>(undefined);

export function TabsProvider({
  children 
}: {
  children: React.ReactNode 
}) {
  const [state, setState] = useState<TabsState>({});

  const setActiveTab = (groupId: string, tabId: number) => {
    setState((prev) => ({ ...prev, [groupId]: tabId }));
  };

  return (
    <TabsContext.Provider value={{ state, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

export function Tabs({
  groupId,
  defaultOpen = 0,
  children,
}: {
  groupId: string;
  defaultOpen?: number;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs must be inside TabsProvider");

  useEffect(() => {
    if (ctx.state[groupId] === undefined) {
      ctx.setActiveTab(groupId, defaultOpen);
    }
  }, [groupId, defaultOpen, ctx]);

  return (
    <GroupContext.Provider value={{ groupId }}>
      {children}
    </GroupContext.Provider>
  );
}


export function TabItems({ children, className = "" }: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs must be inside TabsProvider");

  let id = 0;

  const wrapped = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const element = (
      <ItemContext.Provider value={{ tabId: id, setTabId: () => {} }}>
        {child}
      </ItemContext.Provider>
    );

    id++;
    return element;
  });

  return <div className={className}>{wrapped}</div>;
}


export function TabTrigger({
  children,
  className = "",
  activeClass = "",
  inActiveClass = ""
}: {
  children: React.ReactNode;
  className?: string;
  activeClass?: string;
  inActiveClass?: string;
}) {
  const ctx = useContext(TabsContext);
  const groupCtx = useContext(GroupContext);
  const itemCtx = useContext(ItemContext);

  if (!ctx) throw new Error("TabTrigger must be inside TabsProvider");
  if (!groupCtx) throw new Error("TabTrigger must be inside Tabs");
  if (!itemCtx) throw new Error("TabTrigger must be inside TabItems");

  const { groupId } = groupCtx;
  const { tabId } = itemCtx;
  const isActive = ctx.state[groupId] === tabId;

  return (
    <button
      className={`cursor-pointer ${className} ${isActive ? activeClass : ""} ${!isActive ? inActiveClass : ""}`}
      onClick={() => ctx.setActiveTab(groupId, tabId)}
    >
      {children}
    </button>
  );
}

export function TabContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  const groupCtx = useContext(GroupContext);
  const itemCtx = useContext(ItemContext);

  if (!ctx) throw new Error("TabContent must be inside TabsProvider");
  if (!groupCtx) throw new Error("TabContent must be inside Tabs");
  if (!itemCtx) throw new Error("TabContent must be inside TabItems");

  const { groupId } = groupCtx;
  const { tabId } = itemCtx;
  const isActive = ctx.state[groupId] === tabId;

  return (
    <div className={className} style={{ display: isActive ? "block" : "none" }}>
      {children}
    </div>
  );
}

