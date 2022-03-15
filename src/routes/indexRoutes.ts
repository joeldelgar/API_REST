import {Request, Response, Router} from 'express';  //Import SOME modules from express.

//This is only an intermediate page for potential future uses. This page currently shows you the URL to the API.

class IndexRoutes {
    public router:Router;
    constructor(){
        this.router = Router ();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    routes(){
        this.router.get('/', (req, res) => res.status(200).send('API: /api'));
    }
}

const indexRoutes = new IndexRoutes();
indexRoutes.routes();

export default indexRoutes.router;

