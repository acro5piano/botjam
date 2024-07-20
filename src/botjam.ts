import { execa } from 'execa'
import { PacmanModule } from './modules/pacman'
import { createState } from './state'

export class Botjam {
  state = createState()
  tasks = {
    pacman: PacmanModule(this.state),
  }

  async run() {
    for (const operation of this.state.operations) {
      await operation.run({
        async runCommand(command) {
          // TODO: sudo pattern
          if (operation.become) {
            return execa({ reject: false })`sudo ${command}`
          } else {
            return execa({ reject: false })`${command}`
          }
        },
      })
    }
  }
}

export const botjam = new Botjam()
