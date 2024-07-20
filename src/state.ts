export type BaseModuleArgs = {
  become?: boolean
}

export type Operation = BaseModuleArgs & {
  become?: boolean
  run: (context: Context) => Promise<unknown>
}

export type State = {
  operations: Operation[]
}

export const createState = (): State => ({
  operations: [],
})

export type Context = {
  // TODO: correct typing
  runCommand: (command: string) => Promise<any>
}
