window.onload = async () =>{
    let contentDiv = document.getElementById('content');

    let url = '/api/notes';

    let response = await fetch(url);
    let notes = await response.json()
    console.log(notes);

    for (let n of notes) {
        console.log(n);
        let newDiv = document.createElement('div');
        newDiv.classList.add('note');
        newDiv.id=n._id;

        let text = document.createElement('p');
        text.textContent = n.text;
    }
}