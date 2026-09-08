import React from "react";
import { getActivityLogs } from "@/db/repository";
import { Activity, Shield } from "lucide-react";

export const metadata = {
  title: "Activity Audit Trail | Studio Administration",
};

export default async function AdminActivityPage() {
  const logs = await getActivityLogs();

  return (
    <div className="space-y-8 w-full">
      <div className="border-b border-[#1c1d25] pb-4">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          Immutable Audit Trail
        </span>
      </div>

      <div className="bg-[#14151a] border border-[#262833] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#101116] border-b border-[#262833] text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
            <tr>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f212b]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#1a1c23]/60 transition-colors">
                <td className="p-4 font-mono text-[11px] text-[#d1a86e]">
                  {log.action}
                </td>
                <td className="p-4 text-zinc-400 uppercase tracking-wider text-[10px]">
                  {log.entityType}
                </td>
                <td className="p-4 text-zinc-200 font-medium">
                  {log.description}
                </td>
                <td className="p-4 text-right text-zinc-500 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
