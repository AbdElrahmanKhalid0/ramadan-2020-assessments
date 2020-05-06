const getCard = ({topic_title,topic_details,expected_result,votes,status,author_name,submit_date,target_level}) => {
    return `<div class="card-body d-flex justify-content-between flex-row">
                <div class="d-flex flex-column">
                <h3>${topic_title}</h3>
                <p class="text-muted mb-2">${topic_details}</p>
                <p class="mb-0 text-muted">
                    <strong>Expected results:</strong> ${expected_result}
                </p>
                </div>
                <div class="d-flex flex-column text-center">
                <a class="btn btn-link">🔺</a>
                <h3>${votes.ups - votes.downs}</h3>
                <a class="btn btn-link">🔻</a>
                </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
                <div>
                <span class="text-info">${status}</span>
                &bullet; added by <strong>${author_name}</strong> on
                <strong>${new Date(submit_date).toDateString()}</strong>
                </div>
                <div
                class="d-flex justify-content-center flex-column 408ml-auto mr-2"
                >
                <div class="badge badge-success">
                    ${target_level}
                </div>
            </div>`
};

document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.querySelector('#videoRequestForm');
    const requestsList = document.querySelector('#listOfRequests');

    // getting the video requests
    fetch('http://localhost:7777/video-request')
        .then(result => result.json())
        .then(videoRequests => {
            videoRequests.map(videoRequest => {
                const videoCard = document.createElement('div');
                videoCard.classList.add('card','mb-3');
                videoCard.innerHTML = getCard(videoRequest);
                requestsList.appendChild(videoCard)
            })
        })

    videoForm.addEventListener('submit',(e) => {
        e.preventDefault();

        const videoFormElementsValues = Object.keys(videoForm.elements).map(key => videoForm.elements[key].value);
        const [author_name, author_email, topic_title, target_level, topic_details, expected_result] = videoFormElementsValues;

        fetch('http://localhost:7777/video-request', {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                author_name,
                author_email,
                topic_title,
                target_level,
                topic_details,
                expected_result
            })
        })
        
    });
});