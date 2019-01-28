const generateTextMessage = (from, content) => {
    return {
        from,
        content,
        createAt: moment().valueOf()
    }
}

const generateLocationMessage = (from, lat, lng) => {
    return {
        from,
        url: `https://www.google.com/maps?q=${lat},${lng}`,
        createAt: moment().valueOf()
    }
}