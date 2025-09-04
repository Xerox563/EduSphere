import express from 'express'
import cors from 'cors'
import {config} from 'dotenv'
import { CORS_ORIGIN }  from './config/index'
import helmet from 'helmet'
import questionRoute from './routes/question.route'
config()

const app = express()

// middleware
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(helmet())
app.use(express.urlencoded({ extended: true }));


// routes
app.use('/api/v1', questionRoute);

// health check
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    })
})

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ success: false, message })
})

export default app