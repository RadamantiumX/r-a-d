const z = require('zod') // Dependencia para hacer validaciones de datos

// Validamos los campos
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be String',
    required_error: 'Movie title is required'
  }),
  year: z.number().int().positive().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive().positive(),
  rate: z.number().min(0).max(10).default(5.5), // Ponemos un valor por defecto
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-fi']), // Verificamos que sea un ARRAY pero con ese contenido
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object) // Nos devuelve DATOS (si salio todo bien) o ERROR (si salio todo mal)
}

function validatePartialMovie (object) {
  return movieSchema.partial().safeParse(object) // Con "partial", cada una de las propiedades que tenemos en el "schema" van a ser opcionales, valida solamente las que estan
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
