export interface IMouseInput {
  x: number
  y: number
  lastX: number
  lastY: number
  innerX: number
  innerY: number
  draging: boolean
  wheel: number
  lastWheel: number
}

export default class DesktopInput {
  public lockPointer: boolean = false
  public updateRate: number = 1000/60 //ms
  public currentlyPressedKeys: Map<string, boolean>
  public mouseInput: IMouseInput
  private raf = 0

  constructor(public el: HTMLElement, options?: { lockPointer?: boolean, updateRate?: number}) {
    if (options) {
      if (options.lockPointer !== undefined) {
        this.lockPointer = options.lockPointer
      }
      if (options.updateRate !== undefined) {
        this.updateRate = options.updateRate
      }
    }

    this.currentlyPressedKeys = new Map()
    this.mouseInput = {
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      innerX: 0,
      innerY: 0,
      draging: false,
      wheel: 0,
      lastWheel: 0
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      this.currentlyPressedKeys.set(e.key, true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      this.currentlyPressedKeys.set(e.key, false)
    }

    const handleMouseMove = (e: MouseEvent) => {
      this.mouseInput.innerX = e.clientX
      this.mouseInput.innerY = e.clientY
    }
    const handleWheel = (e: WheelEvent) => {
      this.mouseInput.wheel += e.deltaY
    }
    const handleDragStart = () => {
      this.mouseInput.draging = true
    }
    const handleDragEnd = () => {
      this.mouseInput.draging = false
    }
    const addInputListener = () => {
      el.addEventListener('keydown', handleKeyDown)
      el.addEventListener('keyup', handleKeyUp)
      el.addEventListener('mousemove', handleMouseMove)
      el.addEventListener('mousedown', handleDragStart)
      el.addEventListener('mouseup', handleDragEnd)
      el.addEventListener('wheel', handleWheel)
      let lastT = 0
      const af = (t: number) => {
        if (t - lastT > this.updateRate) {
          lastT = t
          this.mouseInput.lastX = this.mouseInput.x
          this.mouseInput.lastY = this.mouseInput.y
          this.mouseInput.x = this.mouseInput.innerX
          this.mouseInput.y = this.mouseInput.innerY
          this.mouseInput.lastWheel = this.mouseInput.wheel
        }
        requestAnimationFrame(af)
      }
      this.raf = requestAnimationFrame(af)
    }
    const removeInputListener = () => {
      el.removeEventListener('keydown', handleKeyDown)
      el.removeEventListener('keyup', handleKeyUp)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mousedown', handleDragStart)
      el.removeEventListener('mouseup', handleDragEnd)
      el.removeEventListener('wheel', handleWheel)
      cancelAnimationFrame(this.raf)
    }

    if (this.lockPointer) {
      // @ts-ignore
      el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock
      // @ts-ignore
      el.exitPointerLock = el.exitPointerLock || el.mozExitPointerLock
      el.addEventListener('click', el.requestPointerLock)
      const handleLockChange = () => {
        // @ts-ignore
        if (document.pointerLockElement === el || document.mozPointerLockElement === el) {
          addInputListener()
        } else {
          removeInputListener()
        }
      }
      document.addEventListener('pointerlockchange', handleLockChange, false)
      document.addEventListener('mozpointerlockchange', handleLockChange, false)
    } else {
      el.contentEditable = 'true'
      el.style.cursor = 'default'
      el.style.outline = 'none'
      addInputListener()
    }
  }
}
