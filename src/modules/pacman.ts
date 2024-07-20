import { createBotjamModule } from './createBotjamModule'
import { BaseModuleArgs } from '../state'

type PacmanArgs = BaseModuleArgs & {
  name: string
  updateCache: boolean
  state: 'present' | 'absent'
}

export const PacmanModule = createBotjamModule<PacmanArgs>({
  async shouldApply(args, context) {
    const { stdout } = await context.runCommand(`pacman -Qq ${args.name}`)
    return stdout.length === 0
  },
  async apply(args, context) {
    console.log(await context.runCommand(`pacman -S ${args.name}`))
  },
})
