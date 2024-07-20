import { spawn } from 'node:child_process'
import { PacmanModule } from './modules/pacman'
import { createState } from './state'
import { NodeSSH } from 'node-ssh'
import consola from 'consola'
import ora from 'ora'

type BotjamConfig = {
  hosts: string[]
  become: boolean
}

export class Botjam {
  state = createState()
  tasks = {
    pacman: PacmanModule(this.state),
  }
  config?: BotjamConfig
  sshInstances = [] as NodeSSH[]

  configure(config: BotjamConfig) {
    this.config = config
  }

  async run() {
    const config = this.config
    if (!config) {
      throw new Error('You need to run `botjam.configure` before anything')
    }

    // TODO: ssh connection
    // await this.ssh.connect({
    // TODO: support multiple hosts
    // host: this.config.hosts[0],
    // username: 'steel',
    // privateKeyPath: '/home/steel/.ssh/id_rsa',
    // })

    const total = this.state.operations.length
    for (const [index, operation] of this.state.operations.entries()) {
      const spinner = ora(`[${index}/${total}] ${operation.name}`)
      spinner.start()
      await operation.run({
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
            await ensureSudo()
          }

          return new Promise((resolve) => {
            // TODO: timeout
            // when timeout, zombie process can remain, so take care
            const ps = spawn(realCommand, realOptions)

            let stdout = ''
            let stderr = ''

            ps.stdout.on('data', (data) => {
              stdout += data.toString()
            })

            ps.stderr.on('data', (data) => {
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
        },
      })
      spinner.succeed(`[${index + 1}/${total}] ${operation.name}`)
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
