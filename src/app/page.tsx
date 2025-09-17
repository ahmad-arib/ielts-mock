export default function Home() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">IELTS Mock Test</h1>
      <p className="mb-4">Pay → get token → login → take test (MVP manual scoring).</p>
      <div className="flex justify-center gap-4">
        <a href="/buy" className="bg-blue-600 text-white px-4 py-2 rounded">Buy Test</a>
        <a href="/login" className="bg-gray-600 text-white px-4 py-2 rounded">Login</a>
      </div>
    </main>
  );
}
