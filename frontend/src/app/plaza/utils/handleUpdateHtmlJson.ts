const handleUpdateHtmlJson = async ({
  htmlJson,
  updateHtmlJson,
  setHTML,
  setSCSS,
  showModal,
}) => {
  if (!htmlJson || htmlJson.length === 0) return;
  setHTML("");
  setSCSS("");
  // setLoading(true);

  // очистка дубликатов style по text
  const styleNodes = htmlJson.filter((n) => n.tag === "style");
  const nonStyleNodes = htmlJson.filter((n) => n.tag !== "style");

  const map = new Map<string, (typeof styleNodes)[number]>();
  for (const item of styleNodes) {
    if (!map.has(item.text)) {
      map.set(item.text, item);
    }
  }
  const uniqueStyleNodes = Array.from(map.values());
  const cleanedHtmlJson = [...nonStyleNodes, ...uniqueStyleNodes];

  //  сохранить очищенное в провайдер
  updateHtmlJson(cleanedHtmlJson);

  try {
    const res = await fetch("/api/json-to-html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedHtmlJson),
    });

    const data = await res.json();
    if (!res.ok) {
      showModal(data.error || "Unknown error", "error");
      return;
    }

    setHTML(data.html);
    setSCSS(data.scss);
    const el = document.getElementById("preview-section");
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    showModal(message, "error");
  } finally {
    // setLoading(false);
  }
};

export default handleUpdateHtmlJson;
