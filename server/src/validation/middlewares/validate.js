import logger from '#src/config/logger.js';
import ApiResponse from '#src/utils/response.util.js';

const options = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
};

export const validate =
    (schema, source = 'body') =>
    async (req, res, next) => {
        const { error, value } = schema.validate(req[source], options);

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');
            logger.error(
                `Validation error: ${req.originalUrl} - ${errorMessage}`,
            );

            const validationErrors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/['"]/g, ''),
            }));

            return ApiResponse.error(
                400,
                'Validation error',
                validationErrors,
            ).send(res);
        }

        // Handle query parameters differently since req.query is read-only
        if (source === 'query') {
            // Store validated query params in a separate property
            // Controllers should use req.validatedQuery for validated/type-converted values
            req.validatedQuery = value;
        } else {
            req[source] = value;
        }
        next();
    };
