import { getAdminLogs } from "@/lib/actions/audit";
import { ShieldAlert, Activity, Filter, Clock } from "lucide-react";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export default async function AdminAuditLogsPage() {
  const logs = await getAdminLogs() as AuditLog[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 text-foreground max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Audit Trail</h1>
          <p className="text-muted-foreground text-[10px] mt-1 uppercase tracking-widest font-bold">
            Security logs and sensitive administrative actions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D5A754] bg-[#D5A754]/10 border border-[#D5A754]/30 px-4 py-2 rounded-sm shadow-sm">
            <ShieldAlert className="w-4 h-4" /> Strictly Confidential
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border bg-background/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">System Record</h3>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-3 h-3" /> Filter Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border">
                <th className="px-6 py-5 w-40">Timestamp</th>
                <th className="px-6 py-5">Action</th>
                <th className="px-6 py-5">Entity Type</th>
                <th className="px-6 py-5">Entity ID</th>
                <th className="px-6 py-5 w-1/3">Context / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2D]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Clock className="w-8 h-8 opacity-50" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No audit logs recorded yet.</p>
                      <p className="text-[9px] text-zinc-600 uppercase tracking-widest max-w-sm">
                         Sensitive actions such as refunds, account suspensions, and product deletions will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-[#2A2A2D]/20 transition-colors font-mono text-[11px]">
                    <td className="px-6 py-5 text-muted-foreground tracking-tight">
                      {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-sm uppercase tracking-widest font-bold text-[9px] ${
                        log.action.includes('delete') || log.action.includes('refund') || log.action.includes('suspend')
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-zinc-300 uppercase tracking-widest font-sans font-bold text-[10px]">
                      {log.entity_type}
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">
                      {log.entity_id}
                    </td>
                    <td className="px-6 py-5">
                      <pre className="text-[9px] text-muted-foreground overflow-x-auto bg-background p-2 border border-border rounded-sm whitespace-pre-wrap max-h-20 max-w-xs">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
