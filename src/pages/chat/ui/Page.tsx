import { CONVERSATIONS, MESSAGES } from "../model/constants";


export default function ChatPage() {
  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-6">
        <aside className="hidden w-72 flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur md:flex">
          <div className="mb-4">
            <h1 className="text-lg font-semibold">ProMentor Chat</h1>
            <p className="mt-1 text-sm text-slate-400">Smart coaching conversations</p>
          </div>

          <button className="mb-5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400">
            + New Chat
          </button>

          <div className="flex flex-col gap-2">
            {CONVERSATIONS.map((item) => (
              <button
                key={item.id}
                className="w-full rounded-xl border border-transparent bg-slate-800/70 px-3 py-2 text-left transition hover:border-slate-700 hover:bg-slate-800"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-slate-400">{item.updatedAt}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[80vh] flex-1 flex-col rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
          <header className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-base font-semibold">Chat Assistant</h2>
            <p className="text-sm text-slate-400">Ask about plans, goals, and productivity.</p>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {MESSAGES.map((message) => {
              const isUser = message.role === "user";

              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-cyan-500 text-slate-950"
                        : "border border-slate-800 bg-slate-800/70 text-slate-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}
          </div>

          <form className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 px-3 py-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
              >
                Send
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
