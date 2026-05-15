export default function InboxPage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-green-600">BrilDesk</h1>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <a
            href="/inbox"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-green-50 text-green-700"
          >
            Inbox
          </a>
          <a
            href="/inbox?filter=assigned"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
          >
            Assigned to Me
          </a>
          <a
            href="/inbox?filter=unassigned"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
          >
            Unassigned
          </a>
        </nav>
      </aside>

      {/* Conversation list */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <p className="p-4 text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Select a conversation to start</p>
      </div>
    </div>
  );
}
