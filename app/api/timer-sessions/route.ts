import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { template_id } = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('timer_sessions')
      .insert({
        user_id: user.id,
        template_id,
        status: 'running',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      session_id: data.id,
      started_at: data.started_at,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session_id, status } = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let updateData: any = { status }

    if (status === 'completed' || status === 'cancelled') {
      const { data: session } = await supabase
        .from('timer_sessions')
        .select('started_at')
        .eq('id', session_id)
        .eq('user_id', user.id)
        .single()

      if (session) {
        const durationSeconds = Math.floor(
          (Date.now() - new Date(session.started_at).getTime()) / 1000
        )
        updateData = {
          status,
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
        }
      }
    }

    const { data, error } = await supabase
      .from('timer_sessions')
      .update(updateData)
      .eq('id', session_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
