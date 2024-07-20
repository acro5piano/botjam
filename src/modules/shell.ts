import { createBotjamModule } from './createBotjamModule'
import { BaseModuleArgs } from '../state'

type ShellArgs = BaseModuleArgs & {
  cmd: string
}

export const ShellModule = createBotjamModule<ShellArgs>({
  getName(args) {
    return `Run a shell command: ${args.cmd}`
  },
  async shouldApply() {
    return true
  },
  async apply(args, context) {
    const [command, ...commandArgs] = args.cmd.split(' ')
    if (!command) {
      throw new Error('Invalid Command')
    }
    const res = await context.runCommand(command, commandArgs)
    context.debug(res)
    if (res.error) {
      throw res.error
    }
  },
})
