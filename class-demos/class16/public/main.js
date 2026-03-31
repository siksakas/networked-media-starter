window.onload = async () => {
    let url = '/api/messages'

    let response = await fetch(url)
    console.log(response)

    let json = await response.json()
    console.log(json)
}