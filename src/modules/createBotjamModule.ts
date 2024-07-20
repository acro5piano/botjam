import consola from 'consola'
import { State, Context, BaseModuleArgs } from '../state'

type BotjamModuleFactory<T extends BaseModuleArgs> = {
  shouldRun: (args: T, context: Context) => boolean | Promise<boolean>
  apply: (args: T, context: Context) => Promise<any>
  getName: (args: T) => string
}

export function createBotjamModule<T extends BaseModuleArgs>(
  factory: BotjamModuleFactory<T>,
) {
  return function botjamModule(state: State) {
    const run = async (args: T, context: Context) => {
      const shouldRun = await factory.shouldRun(args, context)
      if (shouldRun) {
        await factory.apply(args, context)
        consola.info(`==> CHANGED`)
      }
    }
    return function addOperation(args: T) {
      state.operations.push({
        name: factory.getName(args),
        become: args.become,
        run(context) {
          return run(args, context)
        },
      })
    }
  }
}
