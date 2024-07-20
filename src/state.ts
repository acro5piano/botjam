import { ExecException } from 'node:child_process'

export type BaseModuleArgs = {
  debug?: boolean
  become?: boolean | undefined
}

export type Operation = BaseModuleArgs & {
  name: string
  become?: boolean | undefined
  run: (context: Context) => Promise<unknown>
}

export type State = {
  operations: Operation[]
}

export const createState = (): State => ({
  operations: [],
})

export type Context = {
  runCommand: (
    command: string,
    args?: string[],
  ) => Promise<{ error: null | ExecException; stdout: string; stderr: string }>
  debug: (...args: any) => void
}
