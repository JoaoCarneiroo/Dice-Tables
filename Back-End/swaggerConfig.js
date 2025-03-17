const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Dice Tables API',
            description: 'Employee API Information',
            contact: {
                name: 'João Carneiro'
            },
        },
        servers: [
            {
                url: "http://localhost:3000/"
            }
        ],
    },
    apis: ['./routes/*.js']
}

module.exports = swaggerOptions;
