const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Dice & Tables API',
            description: 'Informações da API',
            contact: {
                name: 'João Carneiro'
            },
        },
        servers: [
            {
                url: process.env.CLIENT_URL || "http://localhost:3000/"
            }
        ],
        tags : [
            {name: "Utilizadores", description: "Endpoints para Utilizadores"},
            {name: "Gestores", description: "Endpoints para Gestores"},
            {name: "Cafés", description: "Endpoints para Cafés"},
            {name: "Reservas", description: "Endpoints para as Reservas"},
            {name: "Mesas", description: "Endpoints para gerenciar Mesas dos Cafés"},
            {name: "Jogos", description: "Endpoints para gerenciar Jogos dos Cafés"},

        ],
        components: {
            securitySchemes: {
              CookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "Authentication",
                description: "Autenticação de Sessão usando uma Cookie",
              },
            },
            schemas: {
                Utilizador: {
                  type: "object",
                  properties: {
                    ID_Utilizador: { type: "integer", example: "1" },
                    Nome: { type: "string", example: "Joao Carneiro" },
                    Email: { type: "string", format: "email", example: "joao@example.com", maxLenght: 100},
                    Password: { type: "string", format: "password", example: "batata123", writeOnly: true },
                    Cargo: { type: "string", enum: ["Admin", "Gestor", "Utilizador"], example: "Gestor" },
                  },
                  required: ["ID_Utilizador", "Nome", "Email", "Cargo"],
                },
            },
        },
        
    },
    apis: ['./routes/*.js']
}

module.exports = swaggerOptions;
