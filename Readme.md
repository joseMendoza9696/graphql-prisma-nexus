**GRAPHQL API**

El proyecto es la estructura básica de una API de graphql. Utiliza prisma2 como 
ORM para una base de datos en POSTGRESQL, Nexus.js para el binding entre prisma2 
y graphql.

El proyecto se basó principalmente en el tutorial de Nexus.js `https://nexusjs.org/docs/getting-started/tutorial/chapter-introduction`

**Requisistos**
- node js version +10
- npm
- graphql
- postgresql
- pgadmin
- puede funcionar con cualquier base de datos relacional

**Archivos adicionales**
- Debes crearte una carpeta config y el archivo config/dev.env
- En el archivo debes colocar tus variables de entorno para la conexion a tu base de datos
- dev.env:
  DATABASE="postgresql://<username>:<password>@<host>:<port>/<data_base>"
  DATABASE_TESTING="postgresql://<username>:<password>@<host>:<port>/<data_base>?schema="

**Comando especiales**
- para correr `npx prisma migrate` se debe utilizar el siguiente comando:
`dotenv -e config/dev.env -- npx prisma migrate dev --preview-feature`
  para poder utilizar las variables de entorno de nuestro proyecto


