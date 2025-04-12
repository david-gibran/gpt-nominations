# MVP: Evaluador de Nominaciones con IA

Este proyecto es un MVP (Producto Mínimo Viable) que implementa una API para evaluar nominaciones dentro de una aplicación de reconocimiento empresarial utilizando la API de OpenAI. El sistema analiza el contenido del mensaje de reconocimiento y determina si cumple con los lineamientos establecidos por cada empresa.

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- OpenAI API (GPT-4o)
- JSON como formato de entrada y salida

## Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/david-gibran/gpt-nominations.git
cd gpt-nominations
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` con las siguientes variables:

```env
OPENAI_API_KEY=tu_clave_api_de_openai
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/mi_basededatos
OPENAI_MODEL=gpt-4o
PORT=8080
```

4. Configura tu base de datos PostgreSQL. Puedes usar el siguiente script para crear las tablas necesarias:

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE company_guidelines (
    id SERIAL PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    guideline TEXT NOT NULL
);
```

5. Inicia el servidor:

```bash
node index.js
```

El servidor estará disponible en `http://localhost:8080`.

## Endpoint disponible

### Evaluar nominación

**POST** `/evaluate`

**Body:**

```json
{
  "company_id": "uuid-de-la-empresa",
  "message": "Gracias por tu esfuerzo en el evento",
  "language": "es"
}
```

**Respuesta ejemplo:**

```json
{
  "statusCode": 2,
  "message": "El mensaje es un poco vago. ¿Te gustaría enviarlo de todos modos?",
  "score": 75
}
```


## Prueba rápida con curl

Puedes probar el servicio directamente desde la terminal usando el siguiente comando:

```bash
curl -X POST http://localhost:8080/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "cc007a08-c3a1-46b0-b45f-29e354d61579",
    "message": "Gracias por tu esfuerzo el día de ayer en el evento.",
    "language": "es"
  }'
```


## Licencia

Este proyecto está licenciado bajo los términos de la Licencia MIT.
Esto significa que puedes usar, modificar y distribuir el código (incluso con fines comerciales), siempre que mantengas el aviso de copyright original y esta misma licencia en cualquier copia.

Consulta el archivo LICENSE incluido en este repositorio para conocer todos los detalles.