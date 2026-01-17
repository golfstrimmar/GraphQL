// 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹
export default function BlockHeader({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-1 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
        <span>{icon}</span>
      </div>
      <h5 className="text-2xl font-bold text-slate-800">{text}</h5>
    </div>
  );
}
