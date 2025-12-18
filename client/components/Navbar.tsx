export default function Navbar() {
  return (
    <nav className="w-full p-4 border-b flex justify-between">
      <h1 className="font-bold text-lg">SafeSpace Teens</h1>
      <div className="space-x-4">
        <span>Home</span>
        <span>Chatrooms</span>
        <span>Reading Hub</span>
        <span>Journal</span>
      </div>
    </nav>
  );
}
