import express from 'express'
import cors from 'cors'
import {config} from 'dotenv'
import { CORS_ORIGIN }  from './config/index'
import helmet from 'helmet'
import questionRoute from './routes/question.route'
config()

const app = express()
app.set('trust proxy', 1)

// middleware
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({ limit: '1mb' }))
app.use(helmet())
app.use(express.urlencoded({ extended: true }));

// simple request logger with timing
app.use((req, res, next) => {
    const startedAt = Date.now()
    res.on('finish', () => {
        const durationMs = Date.now() - startedAt
        console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`) 
    })
    next()
})


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