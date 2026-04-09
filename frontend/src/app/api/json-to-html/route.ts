import { NextResponse } from "next/server";
import runClearPipeline from "@/app/api/json-to-html/utils/clearFunctions";

// ===> ROUTE  ===>===>===>===>===>===>
export async function POST(request: Request) {
  try {
    const body = await request.json(); // htmlJson
    const nodes = body || [];

    if (!Array.isArray(nodes) || nodes.length === 0) {
      return NextResponse.json({ html: "", scss: "", js: "", pug: "" });
    }

    // единый конвейер: дерево -> html / scss / js
    const { html, scss, js } = await runClearPipeline(nodes);

    // console.log("<===html===>", html);
    // console.log("<===scss===>", scss);
    // console.log("<===js===>", js);

    return NextResponse.json({
      html,
      scss,
      js,
      pug: "",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}