import { createBotjamModule } from './createBotjamModule'
import { BaseModuleArgs } from '../state'

type PacmanArgs = BaseModuleArgs & {
  name: string
  updateCache: boolean
  state: 'present' | 'absent'
}

export const PacmanModule = createBotjamModule<PacmanArgs>({
  getName(args) {
    return `Install package with pacman: ${args.name}`
  },
  async shouldRun(args, context) {
    const { stdout } = await context.runCommand('pacman', ['-Qq', args.name])
    return stdout.length === 0
  },
  async apply(args, context) {
    await context.runCommand('pacman', ['-S', '--noconfirm', args.name])
  },
})
