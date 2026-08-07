export default function WhatsAppMockup() {
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="rounded-[2rem] border-[6px] border-slate-800 dark:border-slate-600 bg-white dark:bg-[#0f172a] shadow-2xl shadow-blue-900/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-2 pb-1 bg-slate-100 dark:bg-[#1e293b]">
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">9:41</span>
          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">●●● ▰</span>
        </div>

        <div className="flex items-center gap-2.5 bg-[#075E54] px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">KB</div>
          <div>
            <p className="text-xs font-semibold text-white">Keel Bot</p>
            <p className="text-[9px] text-green-200">online</p>
          </div>
        </div>

        <div className="bg-[#e5ddd5] dark:bg-[#0b1d26] p-3 min-h-[250px] flex flex-col">
          <p className="self-center text-center text-[8px] text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/10 rounded-full px-2 py-0.5">Today</p>

          <div className="max-w-[80%] self-end mt-2">
            <p className="bg-[#dcf8c6] dark:bg-[#054d33] text-slate-800 dark:text-slate-100 rounded-lg rounded-br-none px-2.5 py-1.5 text-[10px] leading-snug">
              How much is the Nike Court sneaker? 😍
            </p>
            <p className="text-right text-[7px] text-slate-400 mt-0.5">10:32 ✓✓</p>
          </div>

          <div className="max-w-[85%] self-start mt-1.5">
            <p className="bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-100 rounded-lg rounded-bl-none px-2.5 py-1.5 text-[10px] leading-snug">
              Hello! 👋 The Nike Court Vision Lo is <span className="font-bold">KSh 4,500</span> — 12 left in stock. Want me to hold one for you? 📦
            </p>
            <p className="text-[7px] text-slate-400 mt-0.5">10:32</p>
          </div>

          <div className="max-w-[70%] self-end mt-1.5">
            <p className="bg-[#dcf8c6] dark:bg-[#054d33] text-slate-800 dark:text-slate-100 rounded-lg rounded-br-none px-2.5 py-1.5 text-[10px] leading-snug">
              Yes, deliver today 🚚
            </p>
            <p className="text-right text-[7px] text-slate-400 mt-0.5">10:33 ✓✓</p>
          </div>

          <div className="max-w-[85%] self-start mt-1.5">
            <p className="bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-100 rounded-lg rounded-bl-none px-2.5 py-1.5 text-[10px] leading-snug">
              Great choice! Share your location and I'll confirm the delivery time in seconds.
            </p>
            <p className="text-[7px] text-slate-400 mt-0.5">10:33</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#1e293b] px-3 py-2">
          <span className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="flex-1 h-6 rounded-full bg-white dark:bg-slate-800" />
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400 dark:text-slate-500">
        Your customers get answers even while you sleep.
      </p>
    </div>
  );
}
