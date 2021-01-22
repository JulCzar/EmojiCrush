import MovementInfo from './models/movement.js'

export const createRenderEngine = ({
  renderInterface,
  width = 4,
  height = 4,
  gridSize,
  animationDuration = 250,
  animatedInterface
}) => {
  if (!animatedInterface) throw new Error('target interface of animation engine not declared')
  const app = document.querySelector(renderInterface)
  const observers = []

  const generateFallingAnimations = () => {
    const dropCss = []

    for (let i=height; i>0; i--) {
      dropCss.push(`@keyframes falling-${i}-blocks { 0% { transform: translateY(-${i*gridSize}px) }; 100% {} }`)
      dropCss.push(` .fall-${i}-blocks { animation: falling-${i}-blocks; animation-duration: calc(var(--animationDuration)/2); }`)
    }

    return dropCss.join('')
  }

  const start = () => {
    console.log('animation engine started')

    const style = document.createElement('style')
    style.innerText += `body { --animationDuration: ${animationDuration*2}ms; --gridSize: ${gridSize}px; }`
    style.innerText += generateFallingAnimations()
    document.head.append(style)
    
  }

  const subscribe = observer => {
    observers.push(observer)
    
    console.log(`${observers.length} observers subscribed to execute at animation end`)
  }

  /**
   * @param {HTMLElement} target 
   * @param {MovementInfo} movement 
   */
  const notifyAll = (movement, target) => {
    console.log(`notifying ${observers.length} observers about an animation start`)

    observers.forEach(observer => observer({movement, target}))
  }

  /**
   * @param {HTMLElement} target 
   * @param {MovementInfo} movement 
   */
  const fireAnimation = (target, movement) => {
    const { x, y, direction } = movement
    const row = Number(target.attributes.row.value)
    const col = Number(target.attributes.col.value)

    target.classList.add(`movement_${direction}`)

    for (const gem of document.querySelectorAll(animatedInterface)) {
      const oppositeDirection = MovementInfo.getOppositeDirection(direction)
      const gemRow = Number(gem.attributes.row.value)
      const gemCol = Number(gem.attributes.col.value)

      if (gemRow == (row + y) && gemCol == (col + x))
        gem.classList.add(`movement_${oppositeDirection}`)
    }
  }
  
  /**
   * @param {HTMLElement} target 
   * @param {MovementInfo} movement 
   */
  const removeAnimation = (target, movement) => {
    const { x, y, direction } = movement
    const row = Number(target.attributes.row.value)
    const col = Number(target.attributes.col.value)

    target.classList.remove(`movement_${direction}`)

    for (const gem of document.querySelectorAll(animatedInterface)) {
      const oppositeDirection = MovementInfo.getOppositeDirection(direction)
      const gemRow = Number(gem.attributes.row.value)
      const gemCol = Number(gem.attributes.col.value)

      if (gemRow == (row + y) && gemCol == (col + x))
        gem.classList.remove(`movement_${oppositeDirection}`)
    }
  }

  /**
   * @param {MovementInfo} movement 
   * @param {HTMLElement} target
   */
  const triggerSwapAnimation = ({movement, target}) => {
    notifyAll(movement, target)

    fireAnimation(target, movement)

    setTimeout(() => removeAnimation(target, movement), animationDuration*2)
  }
  
  /**
   * @param {number[][]} gameGrid 
   */
  const render = (gameGrid, changes) => {
    const emojis = ['fa-grin-tongue', 'fa-grin-hearts', 'fa-grin-stars', 'fa-grin-beam-sweat', 'fa-flushed']

    const gameGridHTML = ['<div class="table">']
    
    for (let y=0; y<width; y++) {
      gameGridHTML.push('<div class="row">')
      
      for (let x=0; x<height; x++) {
        const value = gameGrid[y][x]
        const fall = changes[y][x]?`fall-${changes[y][x]}-blocks`:''
        gameGridHTML.push(`<div draggable="false" row="${y}" col="${x}" class="gem far ${emojis[value] || ''} ${fall}"></div>`)
      }

      gameGridHTML.push('</div>')
    }
    gameGridHTML.push('</div>')

    app.innerHTML = gameGridHTML.join('')
  }

  start()

  return {
    render,
    triggerSwapAnimation,
    subscribe
  }
}