export default function Bage({ text }) {
  return (
    <div className="text-center py-6 ">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📁</span>
      </div>
      {text && <p className="text-slate-600 text-lg mb-6">{text}</p>}
    </div>
  );
}
