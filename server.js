const express = require('express')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare()
    .then(() => {
        const server = express()

        server.get('/:category', (req, res) => {
            return app.render(req, res, '/', {
                category: req.params.category,
            })
        })

        server.get('/:category/:id', (req, res) => {
            return app.render(req, res, '/article', {
                category: req.params.category,
                id: req.params.id,
            })
        })

        server.get('*', (req, res) => {
            return handle(req, res)
        })

        server.listen(port, (err) => {
            if (err) throw err
            console.log(`> Ready on http://localhost:${port}`)
        })
    })
