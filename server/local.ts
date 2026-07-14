import 'dotenv/config'
import { app } from './index.js'

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => console.log(`Overhørt API kjører på http://localhost:${port}`))
