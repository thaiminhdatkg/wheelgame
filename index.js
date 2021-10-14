const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io')(server);
const users = {}
const wheelList = [
    { item: 0, text: 'Uống nửa ly' },
    { item: 0, text: 'Uống 01 ly' },
    { item: 0, text: 'Uống 02 ly' },
    { item: 0, text: 'Khỏi uống, phẻ' },
    { item: 0, text: 'Mình và 2 bên uống 01 ly' },
    { item: 0, text: '2 bên uống 01 ly, mình khỏi uống' },
    { item: 0, text: 'Chỉ 01 người uống cùng mình' },
    { item: 0, text: 'Tất cả uống' },
    { item: 0, text: 'Tiếp theo uống 01 ly' },
]

app.use(express.static(__dirname + '/public'))
app.get('/', async (req, res) => {
    res.sendFile(__dirname + '/views/wheel.html')
})

const port = 6116

server.listen(6116, () => {
    console.log(`server is running at port ${port}`)
})

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

io.sockets.on('connection', (socket) => {
    socket.on('new-user', ({name}) => {
        /*
        if (name in users) {
            data(false)
        } else {
            data(true)
        }*/
        socket.nickname = name
        users[socket.nickname] = socket
        updateNickNames()
    })

    function updateNickNames() {
        io.sockets.emit('usernames', Object.keys(users))
    }

    socket.on('open-chatbox', (data) => {
        users[data].emit('openbox', {nick: socket.nickname})
    })

    socket.on('send-message', (data) => {
        io.sockets.emit('new-message', { message: data, nick: socket.nickname })
    })
    socket.on('get-new-wheel-list', () => {
        io.sockets.emit('set-new-wheel-list', wheelList)
    })
    socket.on('get-new-wheel-result', () => {
        let result = randomIntFromInterval(0, wheelList.length - 1)
        io.sockets.emit('set-new-wheel-result', { result })
    })

    socket.on('disconnect', (data) => {
        if (!socket.nickname) return
        delete users[socket.nickname]
        updateNickNames()
    })
})