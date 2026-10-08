import { NextResponse } from 'next/server';
import { resetServerStore } from '@/lib/serverStore';

export async function POST() {
  resetServerStore();
  return NextResponse.json({
    status: 'success',
    message: 'Server memory store reseeded to baseline dataset.',
    timestamp: new Date().toISOString(),
  });
}
