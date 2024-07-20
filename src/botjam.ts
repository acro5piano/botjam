import { exec, spawn } from 'node:child_process'
import { PacmanModule } from './modules/pacman'
import { createState } from './state'
import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import ora from 'ora'
import { ShellModule } from './modules/shell'

type BotjamConfig = {
  hosts: string[]
  become: boolean
}

export class Botjam {
  state = createState()

  tasks = {
    pacman: PacmanModule(this.state),
    shell: ShellModule(this.state),
  }

  config?: BotjamConfig
  sshInstances = new Map<string, NodeSSH>()

  configure(config: BotjamConfig) {
    this.config = config
  }

  async run() {
    const config = this.config
    if (!config) {
      throw new Error('You need to run `botjam.configure` before anything')
    }

    for (const host of config.hosts) {
      if (host !== 'localhost') {
        const ssh = new NodeSSH()
        await ssh.connect({
          host,
          username: 'admin',
        })
        this.sshInstances.set(host, ssh)
      }
    }

    const total = this.state.operations.length
    for (const [index, operation] of this.state.operations.entries()) {
      const spinner = ora(`[${index}/${total}] ${operation.name}`)
      spinner.start()
      for (const host of config.hosts) {
        const ssh = this.sshInstances.get(host)
        await operation.run({
          debug(...args) {
            if (operation.debug) {
              spinner.warn()
              console.debug(`\n\n==== debug (${operation.name}) ====`)
              console.debug(...args)
              console.debug('======================\n')
            }
          },
          async runCommand(command, options = []) {
            let realCommand = command
            let realOptions = [...options]

            if (
              operation.become === true ||
              (config.become === true && operation.become !== false)
            ) {
              realCommand = 'sudo'
              realOptions?.unshift(command)
              spinner.warn()
              if (host === 'localhost') {
                await ensureSudo()
              }
            }

            // I'm not sure which should we use, exec vs spawn
            const realShellCommand = [realCommand].concat(realOptions).join(' ')

            if (host === 'localhost') {
              return new Promise((resolve) => {
                // TODO: timeout
                // when timeout, zombie process can remain, so take care
                // const ps = spawn(realCommand, realOptions)
                const ps = exec(realShellCommand)

                let stdout = ''
                let stderr = ''

                ps.stdout?.on('data', (data) => {
                  stdout += data.toString()
                })

                ps.stderr?.on('data', (data) => {
                  stderr += data.toString()
                })

                ps.on('error', (error) => {
                  resolve({ error, stdout, stderr })
                })

                ps.on('close', (code) => {
                  if (code !== 0) {
                    resolve({
                      error: new Error(`Process exited with code: ${code}`),
                      stdout,
                      stderr,
                    })
                  } else {
                    resolve({ error: null, stdout, stderr })
                  }
                })
              })
            } else {
              if (!ssh) {
                throw new Error('No ssh instance found')
              }
              if (!ssh.isConnected()) {
                throw new Error('SSH instance is not connected')
              }
              const { stdout, stderr, code } =
                await ssh.execCommand(realShellCommand)
              if (code !== 0) {
                return {
                  error: new Error(`Process exited with code: ${code}`),
                  stdout,
                  stderr,
                }
              }
              return { error: null, stdout, stderr }
            }
          },
        })
      }
      spinner.succeed(`[${index + 1}/${total}] ${operation.name}`)
    }
    consola.success('Success!')
    for (const ssh of this.sshInstances.values()) {
      ssh.dispose()
    }
  }
}

async function ensureSudo() {
  const ps = spawn('sudo', ['true'])
  return new Promise<void>((resolve, reject) => {
    ps.on('close', (code) => {
      if (code !== 0) {
        reject()
        throw new Error(
          'An unexpected error occurred while checking sudo privileges.',
        )
      }
      resolve()
    })
  })
}

export const botjam = new Botjam()
