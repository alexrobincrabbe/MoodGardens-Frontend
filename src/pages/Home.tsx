import AuthPanel from "../components/AuthPanel";

export default function Home() {
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-semibold">Grow a picture from your day</h1>
      <p className="text-sm text-neutral-600">
        Write a sentence or drop a song link. We’ll plant a seed and grow a “mood garden.”
      </p>

      <div className="mt-4">
        <AuthPanel />
      </div>
    </section>
  );
}
