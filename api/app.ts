import { server } from "./server";

server.listen(8080).then(({url}) => {
    console.log(`Server is ready on ${url}`)
})
