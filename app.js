const express = require('express')
const crypto = require('node:crypto') // Crea cadenas codificadas
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./movies') // Importamos las validaciones
const cors = require('cors')

const app = express()

// MIDDLEWARE
app.use(express.json())

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]
    // Si incluye el origen
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    // Si no lo incluye o es el mismo
    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.disable('x-powered-by')

// Todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query // Le pasamos el query params
  if (genre) {
    const filteredMovies = movies.filter(
      // El contenido de "genre" en movies.json es un array
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()) // Hacemos la camparacion en minuscula, filtraría indistintamente
    )
    return res.json(filteredMovies)
  }
  res.json(movies) // Devolvemos todas las peliculas
})

// Recuperar una pelicula
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id) // Buscamos la movie por el ID
  if (movie) return res.json(movie) // Si la encuentra
  res.status(404).json({ message: 'Movie not found' })
})

// Crear una nueva pelicula
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body) // Validamos

  // Si hay ERROR
  if (result.error) {
    // Parseamos para que nos muestre el ERROR correctamente
    return res.status(400).json({ error: JSON.parse(result.error.message) }) // Bad Request
  }

  // Si valido correctamente
  const newMovie = {
    id: crypto.randomUUID(), // uuid Version 4
    ...result.data // Usamos SPREAD OPERATOR, aquí los datos ya estan validados
  }

  // Mutamos el ARRAY
  movies.push(newMovie) // Ponemos dentro de MOVIES
  res.status(201).json(newMovie) // Codigo: Se ha creado el recurso
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  // Si falla la validacion
  if (!result.success) {
    return res.status(400).json({ erro: JSON.parse(result.error.message) })
  }

  // Recuperamos la id de los parametros
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  // Si no esta esa pelicula con esa ID
  if (!movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  // Guardamos esta pelicula en el indice
  movies[movieIndex] = updateMovie

  // Devolvemos el JSON de la pelicula actualizada
  return res.json(updateMovie)
})

// Metodo DELETE
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
