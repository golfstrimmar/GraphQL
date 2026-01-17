// app/api/figma-sections/route.ts
import { NextRequest, NextResponse } from "next/server";

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
}

export const maxDuration = 30;

// пороги “нормальной” секции
const MAX_TOTAL_NODES = 50; // сколько нод максимум в поддереве
const MAX_DEPTH = 8; // максимальная глубина вложенности

export async function POST(req: NextRequest) {
  try {
    const figmaJson = await req.json();
    const root = figmaJson.document || figmaJson.structure || figmaJson;

    if (!root) {
      return NextResponse.json(
        { sectionIds: [], message: "No root node in Figma JSON" },
        { status: 200 },
      );
    }

    const sectionIds = collectSectionIds(root);

    return NextResponse.json(
      {
        sectionIds,
        count: sectionIds.length,
        message: `Found ${sectionIds.length} sections/frames (giants skipped)`,
      },
      { status: 200 },
    );
  } catch (e) {
    console.error("figma-sections error", e);
    return NextResponse.json(
      { error: "Failed to collect section ids" },
      { status: 500 },
    );
  }
}

// ===== helpers =====

// Подсчёт количества нод и максимальной глубины поддерева
function analyzeSubtree(node: FigmaNode): {
  totalNodes: number;
  maxDepth: number;
} {
  let total = 0;
  let maxDepth = 0;

  const dfs = (n: FigmaNode, depth: number) => {
    total += 1;
    if (depth > maxDepth) maxDepth = depth;

    if (!n.children) return;
    for (const child of n.children) {
      dfs(child, depth + 1);
    }
  };

  dfs(node, 0);
  return { totalNodes: total, maxDepth };
}

// Берём все FRAME/SECTION, кроме слишком “гигантских”
function collectSectionIds(root: FigmaNode): string[] {
  const ids: string[] = [];

  const walk = (node: FigmaNode, depth: number) => {
    if (node.visible === false) return;
    if (depth > 12) return; // защита от безумной рекурсии

    const isSectionLike = node.type === "FRAME" || node.type === "SECTION";

    if (isSectionLike) {
      const { totalNodes, maxDepth } = analyzeSubtree(node);

      const isGiant = totalNodes > MAX_TOTAL_NODES || maxDepth > MAX_DEPTH;

      if (!isGiant) {
        ids.push(node.id);
      } else {
        // Это как раз твой “Frame 8645” и подобные: страница целиком
        // Их не добавляем, но можем пройти внутрь, чтобы найти поменьше фреймы
        // (если хочешь — оставь проход внутрь, если нет — закомментируй этот блок)
      }
    }

    if (node.children) {
      for (const child of node.children) {
        walk(child, depth + 1);
      }
    }
  };

  walk(root, 0);
  return ids;
}
