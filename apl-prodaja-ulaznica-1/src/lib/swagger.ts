import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ticket Sales API',
            version: '1.0.0',
            description: 'API documentation for the Ticket Sales application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                },
            },
        },
    },
    apis: ['./src/app/api/**/*.ts'], // Path to the API docs
};

export const getApiDocs = () => {
    const spec = swaggerJsdoc(options);
    return spec;
};
