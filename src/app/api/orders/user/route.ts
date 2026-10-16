import { GET as getMeOrders } from '../me/route';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return getMeOrders(req);
}
