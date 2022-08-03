const gameService = require('../services/gameService')
const barstoolAdapter = require('../adapters/barstoolAdapter')

const logger = require('../helper/logging')

const convertLeagueToId = (league) => {
  const { gameIdMap } = barstoolAdapter
  if (gameIdMap[league]) {
    return [gameIdMap[league]]
  }
  return Object.keys(gameIdMap).map((k) => gameIdMap[k])
}

const gamesListController = async (req, res) => {
  let { league } = req.query
  if (!league) {
    league = 'ALL'
  } else if (!barstoolAdapter.gameIdMap[league]) {
    const error = { status: 400, response: 'Invalid league' }
    const logMessage = `[gameController - gamesListController(${league}) - ${error.status} - ${error.response}]`
    logger.log('error', logMessage)
    res.status(error.status).send({ message: error.response })
    return
  }

  const gameIds = convertLeagueToId(league)
  let games
  try {
    games = await gameService.getGamesList(gameIds)
  } catch (error) {
    const status = error.status ? error.status : 500
    res.status(status).send({ message: 'Unable to retrieve game data' })
    return
  }

  res.status(200).send(games)
}

const singleGameController = async (req, res) => {
  const { gameId } = req.params

  let game
  try {
    game = await gameService.getGameById(gameId)
  } catch (error) {
    const status = error.status ? error.status : 500
    res.status(status).send({ message: 'Unable to retrieve game data' })
    return
  }

  res.status(200).send(game)
}

module.exports = {
  gamesListController,
  singleGameController,
}
