import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from '#src/config/env.js';
import logger from '#src/config/logger.js';
import { errorHandler } from '#src/middlewares/error.handler.js';
import { notFoundHandler } from '#src/middlewares/notfound.handler.js';
import routes from '#src/routes/index.js';

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }
            if (
                env.NODE_ENV === 'development' ||
                env.NODE_ENV === 'test' ||
                origin === env.FRONTEND_URL
            ) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    }),
);

app.use(
    morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', {
        stream: {
            write: (message) => logger.http(message.trim()),
        },
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
