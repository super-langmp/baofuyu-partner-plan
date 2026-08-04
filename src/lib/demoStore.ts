import type { ApplicationInput, SystemState } from '../types'
import {
  approveApplication,
  approveSubmission,
  claimDailyTask,
  createApplicationRecord,
  createSeedState,
  payRedemption,
  rejectApplication,
  rejectRedemption,
  rejectSubmission,
  requestRedemption,
  submitClaim,
} from './domain'

const STORAGE_KEY = 'baofuyu_system_v1'
const CHANGE_EVENT = 'baofuyu:datachange'

function applyCurrentPolicy(state: SystemState): SystemState {
  return {
    ...state,
    tasks: state.tasks.map((task) => ({
      ...task,
      instructions: task.instructions.map((instruction) => (
        instruction === '作品公开保留 7 天' ? '作品公开保留 30 天' : instruction
      )),
    })),
  }
}

export function loadSystemState(): SystemState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? applyCurrentPolicy(JSON.parse(stored) as SystemState) : createSeedState()
  } catch {
    return createSeedState()
  }
}

export function saveSystemState(state: SystemState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

function update(transform: (state: SystemState) => SystemState) {
  const current = loadSystemState()
  const next = transform(current)
  saveSystemState(next)
  return next
}

export function subscribeSystemState(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export const demoStore = {
  createApplication(input: ApplicationInput) {
    const application = createApplicationRecord(input)
    update((state) => ({ ...state, applications: [application, ...state.applications] }))
    return application
  },
  approveApplication: (applicationId: string) => update((state) => approveApplication(state, applicationId)),
  rejectApplication: (applicationId: string) => update((state) => rejectApplication(state, applicationId)),
  claimTask: (memberId: string) => update((state) => claimDailyTask(state, memberId)),
  submitClaim: (claimId: string, workUrl: string) => update((state) => submitClaim(state, claimId, workUrl)),
  approveSubmission: (submissionId: string) => update((state) => approveSubmission(state, submissionId)),
  rejectSubmission: (submissionId: string) => update((state) => rejectSubmission(state, submissionId)),
  requestRedemption: (memberId: string, points: number) => update((state) => requestRedemption(state, memberId, points)),
  payRedemption: (redemptionId: string) => update((state) => payRedemption(state, redemptionId)),
  rejectRedemption: (redemptionId: string) => update((state) => rejectRedemption(state, redemptionId)),
  reset() {
    const state = createSeedState()
    saveSystemState(state)
    return state
  },
}
