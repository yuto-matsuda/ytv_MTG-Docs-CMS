import type { OutletContextType } from "@/layouts/DashboardLayout";
import { getImageByPath } from "@/lib/api";
import type { GraphGroup, Image, TabGroup } from "@/lib/types";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useOutletContext } from "react-router";
import remarkGfm from "remark-gfm";
import { GraphGrid } from "./GraphGrid";
import Loading from "./Loading";
import { TabItems, Tabs, TabTrigger } from "./tabs";

async function parseGraphBlock(block: string, userId: string, images: Image[], cashes: Image[], setCashes: React.Dispatch<React.SetStateAction<Image[]>>, authorId: string | undefined) {
  const lines = block.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const result: TabGroup[] = [];
  let currentTab: TabGroup | null = null;
  let currentGroup: GraphGroup | null = null;

  for (const line of lines) {
    if (line.startsWith("[") && line.endsWith("]")) {
      if (currentTab) result.push(currentTab);
      currentTab = { name: line.slice(1, -1), groups: [] };
      currentGroup = null;
      continue;
    }

    if (line.startsWith("(") && line.endsWith(")")) {
      currentGroup = { name: line.slice(1, -1), graphs: [] };
      currentTab?.groups.push(currentGroup);
      continue;
    }

    const match = line.match(/"(.*?)"\s*\{(.*?)\}/);
    if (match) {
      const [_, title, name] = match;
      
      let image = images.find(img => img.path === `${userId}/${name}`);  // (1) 自分の画像から探す
      if (!image && authorId) image = cashes.find(img => img.path === `${authorId}/${name}`);  // (2) キャッシュから探す
      if (!image && authorId) {
        image = await getImageByPath(`${authorId}/${name}`);
        if (image) setCashes(prev => [image!, ...prev]);
      }

      // const image = authorId && authorId !== userId
      //   ? await getImageByPath(`${authorId}/${name}`)
      //   : images.find(img => img.path === `${userId}/${name}`);

      currentGroup?.graphs.push({
        title,
        src: image ? image.url : 'unknown',
      });
      continue;
    }
  }

  if (currentTab) result.push(currentTab);
  return result;
}

async function extractGraphBlocks(content: string, userId: string, images: Image[], cashes: Image[], setCashes: React.Dispatch<React.SetStateAction<Image[]>>, authorId: string | undefined) {
  const graphRegex = /\$\$\$([\s\S]*?)\$\$\$/g;

  const graphBlocks: TabGroup[][] = [];
  let replaced = content;
  const matches = [...content.matchAll(graphRegex)];

  for (const match of matches) {
    const fullMatch = match[0];
    const inner = match[1];
    const graphBlock = await parseGraphBlock(inner, userId, images, cashes, setCashes, authorId);
    graphBlocks.push(graphBlock);
    replaced = replaced.replace(fullMatch, '!!GraphBlock!!');
  }

  return { replaced, graphBlocks };
}

function GraphBlockRenderer({
  graphBlock
}: {
  graphBlock: TabGroup[]
}) {
  return (
    <>
      <div className="flex items-center gap-4 overflow-hidden px-4">
        <Tabs groupId="graphs">
          <TabItems className="flex items-center mb-4">
            {graphBlock.map(tab => (
              <TabTrigger
                key={tab.name}
                className="text-md transition-all px-4 py-1 first:border-r-0"    
                activeClass="text-secondary border-b-4 border-b-secondary font-bold"
                inActiveClass="hover:bg-base-content/5 hover:border-b-4 hover:border-secondary/50"
              >
                {tab.name}
              </TabTrigger>
            ))}
          </TabItems>
        </Tabs>
      </div>
      <Tabs groupId="graphs">
        <TabItems>
          {graphBlock.map(tab => (
            <GraphGrid tab={tab} />
          ))}
        </TabItems>
      </Tabs>
    </>
  );
}

export function ConvertMarkdown({
  content,
  authorId  // 値がある場合 => 本番プレビューモード
}: {
  content: string
  authorId?: string
}) {
  const { user, images, imgCashes, setImgCashes } = useOutletContext<OutletContextType>();
  const [replaced, setReplaced] = useState<string | null>(null);
  const [graphBlocks, setGraphBlocks] = useState<TabGroup[][]>([]);

  useEffect(() => {
    const parseMarkdown = async () => {
      const result = await extractGraphBlocks(content, user.user_id, images, imgCashes, setImgCashes, authorId);
      setReplaced(result.replaced);
      setGraphBlocks(result.graphBlocks);
    }

    parseMarkdown();
  }, [content]);

  if (!replaced) return <Loading />

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1({ children }) {
          return (
            <h2 className="font-bold text-xl mt-4 mb-2">{children}</h2>
          )
        },
        ul({ children }) {
          return (
            <ul className="list-disc ml-8 mb-2">{children}</ul>
          )
        },
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          if (match) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          return (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          const text = String(children)
          let graphIndex = 0;

          if (text.includes('!!GraphBlock!!')) {
            const graphBlock = graphBlocks[graphIndex];
            graphIndex++;
            if (graphBlock === undefined) return <p className="text-error">GraphBlock not Found</p>
            return <GraphBlockRenderer graphBlock={graphBlock} />;
          }

          return <p>{children}</p>
        },
      }}
    >
      {replaced}
    </ReactMarkdown>
  )
}