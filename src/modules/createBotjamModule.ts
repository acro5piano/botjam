import { State, Context, BaseModuleArgs } from '../state'

type BotjamModuleFactory<T extends BaseModuleArgs> = {
  shouldApply: (args: T, context: Context) => boolean | Promise<boolean>
  apply: (args: T, context: Context) => Promise<any>
  getName: (args: T) => string
}

export function createBotjamModule<T extends BaseModuleArgs>(
  factory: BotjamModuleFactory<T>,
) {
  return function botjamModule(state: State) {
    const run = async (args: T, context: Context) => {
      const shouldApply = await factory.shouldApply(args, context)
      if (shouldApply) {
        await factory.apply(args, context)
      }
    }
    return function addOperation(args: T) {
      state.operations.push({
        name: factory.getName(args),
        become: args.become || false,
        run(context) {
          return run(args, context)
        },
      })
    }
  }
}
