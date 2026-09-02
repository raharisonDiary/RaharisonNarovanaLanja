import NetInfo from '@react-native-community/netinfo'
import { mobileApi } from '../api/resources'
import { getQueue, markFailed, markSynced } from '../storage/database'
import {
  getPersonQueue,
  markPersonFailed,
  markPersonSynced,
} from '../storage/personQueue'

export async function syncPending(onProgress?: (done: number, total: number) => void) {
  const state = await NetInfo.fetch()
  if (!state.isConnected) throw new Error('Aucune connexion Internet disponible.')
  const bundleItems = await getQueue()
  const personItems = await getPersonQueue()
  const total = bundleItems.length + personItems.length
  let done = 0
  let errors = 0

  for (const item of bundleItems) {
    try {
      await mobileApi.createBundle(item.payload)
      await markSynced(item.id)
    } catch (error) {
      errors += 1
      await markFailed(
        item.id,
        error instanceof Error ? error.message : 'Erreur inconnue',
      )
    }
    done += 1
    onProgress?.(done, total)
  }

  for (const item of personItems) {
    try {
      await mobileApi.createPerson(item.payload)
      await markPersonSynced(item.id)
    } catch (error) {
      errors += 1
      await markPersonFailed(
        item.id,
        error instanceof Error ? error.message : 'Erreur inconnue',
      )
    }
    done += 1
    onProgress?.(done, total)
  }

  return { total, done, errors }
}
