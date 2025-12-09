import { colors } from "@/constants/colors";
import type { Document, GraphGroup, GraphGroupWithProps } from "./types";

export function attachProps(groups: GraphGroup[]): GraphGroupWithProps[] {
  return groups.map((group, i) => ({
    ...group,
    color: colors[i % colors.length],
    visible: true
  }))
}

export function convertDate(date: Date | undefined) {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return date ? `${year}-${month}-${day}` : '';
}

export function sortDocsByDate(documents: readonly Document[]) {
  return [...documents].sort((a, b) => {
    const timeA = Date.parse(a.mtg_date);
    const timeB = Date.parse(b.mtg_date);
    return timeB - timeA;
  });
}

export function getDuplicateIndices<T>(arr: T[]) {
  const counts = new Map<T, number>();
  
  for (const item of arr) counts.set(item, (counts.get(item) || 0) + 1);

  // 2回以上出てくる要素のインデックスだけ残す
  return arr.map((item, index) => counts.get(item)! > 1 ? index : -1).filter(i => i !== -1);
}

export function getImageName(path: string) {
  const nameParts = path.split('/');
  nameParts.shift();
  return nameParts.join('/');
}

export async function textCopy(text: string) {
  try {
    navigator.clipboard.writeText(text);
  } catch(err) {
    console.log(err);
  }
}