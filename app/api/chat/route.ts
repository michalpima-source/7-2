import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createClient } from '@/lib/supabase/server'
import { GOAL_LABELS, LEVEL_LABELS } from '@/lib/types'
import type { Goal, FitnessLevel } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, clientId }: { messages: UIMessage[], clientId?: string } = await req.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const resolvedClientId = clientId ?? user.id

  let systemPrompt = 'אתה מאמן כושר אישי מקצועי. ענה תמיד בעברית בלבד. היה ממוקד, מעודד ומקצועי.'

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', resolvedClientId)
    .single()

  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('goal, fitness_level, limitations')
    .eq('id', resolvedClientId)
    .single()

  const { data: activePlan } = await supabase
    .from('workout_plans')
    .select(`
      name,
      workout_days (
        day_name,
        exercises ( name, sets, reps )
      )
    `)
    .eq('client_id', resolvedClientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (profile && clientProfile) {
    const goalLabel = clientProfile.goal ? GOAL_LABELS[clientProfile.goal as Goal] : 'לא הוגדר'
    const levelLabel = clientProfile.fitness_level ? LEVEL_LABELS[clientProfile.fitness_level as FitnessLevel] : 'לא הוגדר'

    systemPrompt = `אתה מאמן כושר אישי מקצועי ומסור. ענה תמיד בעברית בלבד.

פרטי המתאמן שלך:
שם: ${profile.full_name}
מטרה: ${goalLabel}
רמת כושר: ${levelLabel}
מגבלות גופניות: ${clientProfile.limitations ?? 'אין'}
${activePlan ? `
תוכנית אימון פעילה: ${activePlan.name}
${(activePlan.workout_days as Array<{ day_name: string; exercises: Array<{ name: string; sets: number; reps: string }> }>)
  .map(day => `${day.day_name}: ${day.exercises.map(e => `${e.name} (${e.sets}×${e.reps})`).join(', ')}`)
  .join('\n')}` : ''}

ענה על שאלות כושר, תזונה וביצוע תרגילים. היה ממוקד, מעודד ומקצועי.`
  }

  const lastMsg = messages.at(-1)
  if (lastMsg?.role === 'user') {
    const parts = lastMsg.parts as Array<{ type: string; text?: string }> | undefined
    const content = parts
      ? parts.filter(p => p.type === 'text').map(p => p.text ?? '').join('')
      : ''
    if (content) {
      await supabase.from('chat_messages').insert({
        client_id: resolvedClientId,
        role: 'user',
        content,
      })
    }
  }

  const result = streamText({
    model: anthropic('claude-sonnet-4-5'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      await supabase.from('chat_messages').insert({
        client_id: resolvedClientId,
        role: 'assistant',
        content: text,
      })
    },
  })

  return result.toTextStreamResponse()
}
