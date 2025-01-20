module.exports = wsInstance => (ws, req) => {
    ws.on('message', rawData => {
        let data = {}
        try {
            data = JSON.parse(rawData)
        } catch(err) {
            console.error(err.message, rawData)
            return
        }
        console.log('Got websocket message', data)
        req.sessionStore.all((err, sessions) => {
            if(!sessions) return
            for(const session_id of Object.keys(sessions)) {
                if(sessions[session_id].passport && sessions[session_id].passport.user) {
                    console.log(session_id, sessions[session_id].passport.user)
                } else {
                    console.log(session_id, 'not-logged-in')
                }
            }
        })
        wsInstance.getWss().clients.forEach(client => {
        })
    })
}