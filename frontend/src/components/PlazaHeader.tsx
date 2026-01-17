type PlazaHeaderProps = {
  title: string;
  description: string;
};

export default function PlazaHeader({ title, description }: PlazaHeaderProps) {
  return (
    <div className="text-center ">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
        {title}
      </h1>
      <p className="text-slate-600 text-lg">{description}</p>
    </div>
  );
}
