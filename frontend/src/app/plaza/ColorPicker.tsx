"use client";
import Colors from "./Colors";

interface ColorGroup {
  neutral: "neutral";
  red: "red";
  orange: "orange";
  yellow: "yellow";
  green: "green";
  cyan: "cyan";
  blue: "blue";
  purple: "purple";
  brown: "brown";
}
type ColorGroup = keyof ColorGroup;

export default function ColorPicker({ toAdd }) {
  const groupsOrder: ColorGroup[] = [
    "neutral",
    "red",
    "orange",
    "yellow",
    "green",
    "cyan",
    "blue",
    "purple",
    "brown",
  ];
  // const groupLabels: Record<ColorGroup, string> = {
  //   neutral: "Нейтральные",
  //   red: "Красные",
  //   orange: "Оранжевые",
  //   yellow: "Жёлтые",
  //   green: "Зелёные",
  //   cyan: "Бирюзовые",
  //   blue: "Синие",
  //   purple: "Фиолетовые",
  //   brown: "Коричневые",
  // };
  return (
    <div className="flex flex-col gap-4">
      {groupsOrder.map((group) => {
        const items = Colors.filter((c) => c.group === group);
        if (!items.length) return null;
        return (
          <div key={group}>
            <div className="flex flex-wrap gap-2">
              {items.map((c) => (
                <button
                  key={c.color}
                  className="w-6 h-6 rounded-full border border-black/10"
                  style={{ backgroundColor: c.value }}
                  title={c.color}
                  onClick={(e) => {
                    toAdd("background-color:" + c.color + ";");
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
