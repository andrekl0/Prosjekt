document.getElementById('draw-card').addEventListener('click', drawCard);

function drawCard() {
    const deckId = 'your_deck_id_here'; 
    fetch(`/temp/deck/${deckId}/card`)
        .then(response => response.json())
        .then(data => {
            if (data.card) {
                const card = data.card;
                const imageUrl = getCardImageUrl(card.suit, card.rank);
                document.getElementById('card-image').src = imageUrl;
            } else {
                alert('No card drawn');
            }
        })
        .catch(error => {
            console.error('Error drawing card:', error);
        });
}

function getCardImageUrl(suit, rank) {
    const apiUrl = `https://deckofcardsapi.com/api/deck/new/draw/?count=1`;
    return `https://deckofcardsapi.com/static/img/${rank[0]}${suit[0]}.png`;
}
