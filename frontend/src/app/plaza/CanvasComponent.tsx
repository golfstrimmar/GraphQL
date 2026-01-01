"use client";
import React from "react";
import PageHeader from "./PlazaComponent/PageHeader";
import { useStateContext } from "@/providers/StateProvider";

export default function CanvasComponent() {
  const { htmlJson } = useStateContext();

  const renderNode = (node: any) => {
    if (!node) return null;
    if (typeof node === "string") {
      return <span key={crypto.randomUUID()}>{node}</span>;
    }

    const Tag = node.tag as keyof JSX.IntrinsicElements;
    if (!Tag) return null;

    const voidTags = [
      "img",
      "input",
      "textarea",
      "br",
      "hr",
      "source",
      "track",
      "meta",
      "link",
      "canvas",
      "iframe",
    ];
    const isVoid = voidTags.includes(node.tag);

    if (isVoid) {
      return (
        <Tag
          key={node._key ?? crypto.randomUUID()}
          {...(node.attributes || {})}
        />
      );
    }

    const children = Array.isArray(node.children)
      ? node.children.map((child: any, idx: number) => (
          <React.Fragment key={child._key ?? idx}>
            {renderNode(child)}
          </React.Fragment>
        ))
      : null;

    return (
      <Tag
        key={`${node._key ?? crypto.randomUUID()}-${node.text ?? ""}`}
        id={node.attributes?.id}
        htmlFor={node.attributes?.for}
        href={node.attributes?.href}
        rel={node.attributes?.rel}
        className={node.class}
        style={typeof node.style === "string" ? undefined : node.style}
      >
        {node.class === "baza" ? "BAZA" : node.text}
        {children}
      </Tag>
    );
  };

  const renderContent = Array.isArray(htmlJson)
    ? htmlJson.map((n: any, i: number) => (
        <React.Fragment key={n._key ?? i}>{renderNode(n)}</React.Fragment>
      ))
    : renderNode(htmlJson);

  return (
    <div className="bg-navy rounded-2xl shadow-xl p-2 border border-slate-200 relative mt-[25px]">
      {PageHeader("canvasIcon", "Canvas")}
      <div
        id="plaza-render-area"
        className="flex flex-col gap-2 mb-2 relative text-[#000]"
      >
        {renderContent}
      </div>
    </div>
  );
}
