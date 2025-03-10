import { env } from '../env'
import { app } from './app'

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`)
  console.log('API-Docs available at GET /docs')
})
