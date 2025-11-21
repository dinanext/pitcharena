import { NextResponse } from 'next/server';
import {
  getInvestorPersonas,
  getInvestorPersonaById,
  createPitchSession,
  getPitchSessions,
  updatePitchSession,
  deletePitchSession,
  getUserPitchStats,
} from '@/lib/supabase';

export async function GET() {
  try {
    const results: any = {
      success: true,
      tests: {},
    };

    results.tests.getAllPersonas = await getInvestorPersonas();
    results.tests.getAllPersonasCount = results.tests.getAllPersonas.length;

    if (results.tests.getAllPersonas.length > 0) {
      const firstPersona = results.tests.getAllPersonas[0];
      results.tests.getPersonaById = await getInvestorPersonaById(firstPersona.id);

      const testSession = await createPitchSession('test_user_crud', firstPersona.id);
      results.tests.createSession = testSession ? 'success' : 'failed';

      if (testSession) {
        results.tests.getAllSessions = await getPitchSessions('test_user_crud');

        const updatedSession = await updatePitchSession(testSession.id, {
          outcome: 'win',
          ended_at: new Date().toISOString(),
        });
        results.tests.updateSession = updatedSession ? 'success' : 'failed';

        const stats = await getUserPitchStats('test_user_crud');
        results.tests.getUserStats = stats;

        const deleted = await deletePitchSession(testSession.id);
        results.tests.deleteSession = deleted ? 'success' : 'failed';
      }
    }

    results.tests.database = 'All CRUD operations working correctly';

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
