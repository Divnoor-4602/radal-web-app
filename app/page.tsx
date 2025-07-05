export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Radal Web
      </header>
      <main className="p-8 flex flex-col gap-16">
        <h1 className="text-4xl font-bold text-center">Welcome to Radal Web</h1>
        <div className="flex flex-col gap-8 max-w-lg mx-auto">
          <p>Your application is ready to be built!</p>
        </div>
      </main>
    </>
  );
}
