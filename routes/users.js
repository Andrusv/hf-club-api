const express = require('express')


function usersApi(app) {
    const router = express.Router();
    app.use('/api/users', router);

    router.post('/create', async (req,res,next) => {
        try{
            res.json({"re":"po"})
        } catch(err) {
            next(err)
        }
    })
}

module.exports = usersApi