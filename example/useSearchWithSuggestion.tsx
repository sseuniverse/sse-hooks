import { useSearchWithSuggestions } from "../packages/hooks/src/useSearchWithSuggestions";

// 1. Sample Data
const USERS = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "designer",
    email: "alice@example.com",
  },
  { id: 2, name: "Bob Smith", role: "developer", email: "bob@example.com" },
  {
    id: 3,
    name: "Charlie Brown",
    role: "manager",
    email: "charlie@example.com",
  },
  {
    id: 4,
    name: "David Wilson",
    role: "developer",
    email: "david@example.com",
  },
];

export default function App() {
  // 2. Initialize the Hook
  const {
    inputProps,
    ghostText,
    filteredData,
    activeCommand,
    isSuggestionAvailable,
  } = useSearchWithSuggestions(
    USERS,
    ["name", "email"], // Default search fields
    {
      commands: [
        // Typing ":role dev" will only search the 'role' field
        { trigger: "role", scope: "role" },
        // Typing ":devs" will filter using this function
        { trigger: "devs", filter: (u) => u.role === "developer" },
      ],
    },
  );

  return (
    <div className="p-8 max-w-lg mx-auto font-sans">
      <h3 className="mb-4 text-xl font-bold">Team Search</h3>

      {/* --- THE INPUT CONTAINER --- */}
      <div className="relative group">
        {/* A. The Ghost Text (Background Layer) */}
        {/* We use the same font/padding as the real input so it aligns perfectly. */}
        <input
          type="text"
          readOnly
          value={ghostText}
          className="absolute inset-0 w-full px-4 py-3 text-gray-300 bg-gray-50 border border-transparent rounded-lg pointer-events-none font-mono"
        />

        {/* B. The Real Input (Foreground Layer) */}
        {/* Background must be transparent so we can see the ghost text behind it. */}
        <input
          {...inputProps}
          className="relative w-full px-4 py-3 text-gray-900 bg-transparent border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono z-10"
        />

        {/* Optional: Tab Hint Badge */}
        {isSuggestionAvailable && (
          <div className="absolute right-3 top-3.5 px-2 py-0.5 text-xs text-gray-500 bg-gray-200 rounded border border-gray-300 pointer-events-none z-20">
            TAB
          </div>
        )}
      </div>

      {/* --- ACTIVE COMMAND INDICATOR --- */}
      {activeCommand && (
        <div className="mt-2 text-sm text-blue-600 font-medium">
          Running command:{" "}
          <span className="bg-blue-100 px-1 rounded">{activeCommand}</span>
        </div>
      )}

      {/* --- RESULTS LIST --- */}
      <ul className="mt-4 space-y-2">
        {filteredData.length === 0 ? (
          <li className="text-gray-500 text-sm">No results found...</li>
        ) : (
          filteredData.map((user) => (
            <li
              key={user.id}
              className="p-3 bg-white border border-gray-100 rounded shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 uppercase tracking-wide">
                {user.role}
              </span>
            </li>
          ))
        )}
      </ul>

      {/* Help Text */}
      <div className="mt-8 text-xs text-gray-400">
        Try typing:
        <ul className="list-disc ml-4 mt-1 space-y-1">
          <li>"Ali" (matches Alice)</li>
          <li>":r" (suggests :role)</li>
          <li>":role dev" (scoped search)</li>
        </ul>
      </div>
    </div>
  );
}
