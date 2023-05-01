function carRequest(action) {
  console.log(`now:::${action}`)
  fetch(`/api/action?go=${action}`, {
    method: 'GET',
  })
}

var lastAction = 'stop'

function run(action) {
  carRequest(action)
  if (action === 'forward' || action === 'backward') {
    lastAction = action
  }
}

function stop(action) {
  console.log(`last:::${lastAction}`)
  console.log(`action:::${action}`)
  if ((lastAction === 'forward' || lastAction === 'backward') && (action !== 'forward' && action !== 'backward')) {
    carRequest(lastAction)
  } else {
    carRequest('stop')
    lastAction = 'stop'
  }
}

export default {
  run,
  stop
}