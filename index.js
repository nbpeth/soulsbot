const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const cors = require('cors')

app.use(cors())
app.use(express.json());
app.use(express.static("build"));

app.get('/api/v1/health', (req, res) => {
    res.status(200)
    res.send({hey: "buddy"})
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})