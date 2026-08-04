import NetInfo from '@react-native-community/netinfo'
import { mobileApi } from '../api/resources'
import { getQueue, markFailed, markSynced } from '../storage/database'

export async function syncPending(onProgress?: (done: number, total: number) => void) {
  const state = await NetInfo.fetch()
  if (!state.isConnected) throw new Error('Aucune connexion Internet disponible.')
  const items = await getQueue(); let done = 0; let errors = 0
  for (const item of items) {
    try { await mobileApi.createBundle(item.payload); await markSynced(item.id) }
    catch (error) { errors += 1; await markFailed(item.id, error instanceof Error ? error.message : 'Erreur inconnue') }
    done += 1; onProgress?.(done, items.length)
  }
  return { total: items.length, done, errors }
}
