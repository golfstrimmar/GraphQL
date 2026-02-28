import { NextResponse } from "next/server";
// const GROQ_API_KEY = process.env.GROQ_API_KEY;
import clearFunctions from "@/app/api/json-to-html/utils/clearFunctions";
const { parseHtml, buildScss } = clearFunctions;

// ===> ROUTE  ===>===>===>===>===>===>
export async function POST(request: Request) {
  try {
    const body = await request.json(); // htmlJson
    const nodes = body || [];
    if (nodes === []) return NextResponse.json({ html: "", scss: "", pug: "" });
    const html = await parseHtml(nodes);
    const scss = buildScss(nodes);
    // console.log("<===html===>", html);
    // console.log("<===scss===>", scss);
    // const transformedNodes = await transformIconsBySrc(nodes);

    // const { html, scssBlocks, pug, inlineScss } =
    //   renderNodesAndCollectScss(transformedNodes);
    // console.log("<===scssBlocks===>", scssBlocks[0].style);
    // const rawScssBlocks = removeDuplicateLiBlocks(
    //   scssBlocksToString(scssBlocks),
    // );

    // style-тэги -> inlineScss, style-поля нод -> rawScssBlocks
    // const rawScss = (inlineScss ? inlineScss + "\n" : "") + rawScssBlocks;
    // let finalScss = rawScssBlocks;
    // если захочешь чистить через Groq — раскомментируй:
    // if (GROQ_API_KEY && rawScss && rawScss.trim()) {
    //   const cleanedByGroq = await callGroq(rawScss);
    //   finalScss = postFixScss(cleanedByGroq || rawScss);
    // } else {
    //   finalScss = postFixScss(rawScss);
    // }

    return NextResponse.json({
      html,
      scss,
      pug: "",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
