"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import type { ClientWithStats } from "@/lib/types"
import { GOAL_LABELS } from "@/lib/types"
import type { Goal } from "@/lib/types"

function completionColor(pct: number) {
  if (pct >= 70) return "bg-green-500/10 text-green-700 border-green-500/20"
  if (pct >= 40) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
  return "bg-red-500/10 text-red-700 border-red-500/20"
}

interface Props {
  clients: ClientWithStats[]
}

export function ClientsTable({ clients }: Props) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-right px-4 py-3 font-medium">שם</th>
            <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">מטרה</th>
            <th className="text-right px-4 py-3 font-medium hidden md:table-cell">תוכנית</th>
            <th className="text-right px-4 py-3 font-medium">השלמה החודש</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {clients.map(client => (
            <tr key={client.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/clients/${client.id}`}
                  className="font-medium hover:underline underline-offset-4"
                >
                  {client.full_name || "—"}
                </Link>
                {client.client_profile?.onboarded_at ? null : (
                  <Badge variant="secondary" className="mr-2 text-xs">לא השלים onboarding</Badge>
                )}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                {client.client_profile?.goal
                  ? GOAL_LABELS[client.client_profile.goal as Goal]
                  : "—"}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {client.active_plan_name ?? "—"}
              </td>
              <td className="px-4 py-3">
                <Badge className={completionColor(client.completion_pct)}>
                  {client.completion_pct}%
                </Badge>
              </td>
              <td className="px-4 py-3">
                {client.phone && (
                  <a
                    href={`https://wa.me/972${client.phone.replace(/^0/, "").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="icon-sm" title="פתח WhatsApp">
                      <MessageCircle className="size-4" />
                    </Button>
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
