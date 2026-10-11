import express from 'express'

import { AuthMiddleware, userMiddleware } from './middleware'
import AuthRoute from './router/auth'
import PaytmRoute from './router/paytm'

const app = express();
app.use(express.json());

app.use('/auth',AuthMiddleware, AuthRoute)
app.use('/user',userMiddleware, PaytmRoute)

app.listen(3000, () => {
    console.log(`Server is running on - http://localhost:3000`);
    
})