import { createBotjamModule } from './createBotjamModule'
import { BaseModuleArgs } from '../state'
import { basename } from 'node:path'

type FileArgs = BaseModuleArgs & {
  src: string
  dest: string
  state: 'link' | 'directory' | 'file'
}

export const FileModule = createBotjamModule<FileArgs>({
  getName(args) {
    return `Ensure file existence of: ${basename(args.src)}`
  },
  async shouldRun(args, context) {
    const { stdout } = await context.runCommand('file', [args.dest])
    if (stdout.includes('No such file')) {
      return true
    }
    if (args.state === 'file') {
      throw new Error('File already exists at: ' + args.dest)
    }
    if (args.state === 'directory') {
      if (!stdout.includes('directory')) {
        throw new Error('File already exists at: ' + args.dest)
      }
      throw new Error('File already exists at: ' + args.dest)
    }
    if (args.state === 'link') {
      if (!stdout.includes('symbolic link')) {
        throw new Error('File already exists at: ' + args.dest)
      }
      return false
    }
    return true
  },
  async apply(args, context) {
    const { stdout } = await context.runCommand('file', [args.src])
    if (stdout.includes('No such file')) {
      throw new Error('No such file: ' + args.src)
    }
    if (args.state === 'file') {
      const res = await context.runCommand('cp', ['-vf', args.src, args.dest])
      context.debug(res)
    }
    if (args.state === 'link') {
      const res = await context.runCommand('ln', ['-svf', args.src, args.dest])
      context.debug(res)
    }
    if (args.state === 'directory') {
      const res = await context.runCommand('mkdir', [args.dest])
      context.debug(res)
    }
  },
})
