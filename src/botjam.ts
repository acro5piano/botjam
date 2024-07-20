import { exec, spawn } from 'node:child_process'
import { PacmanModule } from './modules/pacman'
import { createState } from './state'
import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import ora from 'ora'
import { ShellModule } from './modules/shell'

type Server =
  | 'localhost'
  | {
      host: string
      username: string
      privateKeyPath: string
    }

type BotjamConfig = {
  servers: Server[]
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

    for (const server of config.servers) {
      if (server !== 'localhost') {
        const ssh = new NodeSSH()
        await ssh.connect({
          host: server.host,
          username: server.username,
          privateKeyPath: server.username,
        })
        this.sshInstances.set(server.host, ssh)
      }
    }

    const total = this.state.operations.length
    const sshInstances = this.sshInstances
    for (const [index, operation] of this.state.operations.entries()) {
      const spinner = ora(`[${index}/${total}] ${operation.name}`)
      for (const server of config.servers) {
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
              if (server === 'localhost') {
                await ensureSudo()
              }
            }

            // I'm not sure which should we use, exec vs spawn
            const realShellCommand = [realCommand].concat(realOptions).join(' ')

            if (server === 'localhost') {
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
              const ssh = sshInstances.get(server.host)
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
    consola.info('Cleaning up...')
    for (const ssh of this.sshInstances.values()) {
      ssh.dispose()
    }
    consola.success('Success!')
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
