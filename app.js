let videoRequestsList;

/**
 * 
 * @param {Array} requestsArray
 */

const addRequestsToPageWithSort = (requestsArray) => {
    const requestsList = document.querySelector('#listOfRequests');
    const newFirst = document.querySelector('#newFirst');
    const searchField = document.querySelector('#searchField');

    requestsList.innerHTML = '';

    requestsArray.sort((a,b) => {
        if (newFirst.classList.contains('active')) {
            // it will sort it by date
            const aSubmitDate = a.submit_date
            const bSubmitDate = b.submit_date

            return new Date(bSubmitDate) - new Date(aSubmitDate);
        } else {
            // it will sort it by votes
            const aScore = a.votes.ups - a.votes.downs;
            const bScore = b.votes.ups - b.votes.downs;
            
            return bScore - aScore;
        }
    });

    // validating the search before adding the requests to the page
    requestsArray.filter(videoRequest => {
        // added this condition because without it it will ignore every request doesn't have a title in it
        // and won't show it
        if (searchField.value){
            return videoRequest['topic_title'] ? videoRequest['topic_title'].toLowerCase().includes(searchField.value.toLowerCase()) : false;
        }
        return true
    }).map(videoRequest => {
        const videoRequestCard = getCard(videoRequest);
        requestsList.appendChild(videoRequestCard);
    });
}

const getCard = ({topic_title,topic_details,expected_result,votes,status,author_name,submit_date,target_level,_id}) => {
    const videoCard = document.createElement('div');
    videoCard.classList.add('card','mb-3');
    videoCard.innerHTML = 
        `<div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
            <h3>${topic_title}</h3>
            <p class="text-muted mb-2">${topic_details}</p>
            <p class="mb-0 text-muted">
                ${expected_result && `<strong>Expected results:</strong> ${expected_result}`}
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
            <span class="text-info">${status.toUpperCase()}</span>
            &bullet; added by <strong>${author_name}</strong> on
            <strong>${new Date(submit_date).toDateString()}</strong>
            </div>
            <div
            class="d-flex justify-content-center flex-column 408ml-auto mr-2"
            >
            <div class="badge badge-success">
                ${target_level}
            </div>
        </div>`;
    
        // adding the voting functionality

        // this is the vote score h3 element        
        const voteScore = videoCard.querySelector('.text-center > h3')

        voteUp = videoCard.querySelectorAll('a')[0];
        voteUp.addEventListener('click', () => {
            fetch('http://localhost:7777/video-request/vote', {
                method:'PUT',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id: _id,
                    vote_type: 'ups'
                })
            })
            .then(result => result.json())
            .then(votes => {
                voteScore.innerHTML = votes.ups - votes.downs;
                
                // this updates the sorting list
                videoRequestsList = videoRequestsList.map(videoRequest => {
                    if (videoRequest._id === _id){
                        return {
                            ...videoRequest,
                            votes
                        }
                    };
                    return videoRequest;
                });

                // resorting the requests
                addRequestsToPageWithSort(videoRequestsList);

            });

        });
        
        voteDown = videoCard.querySelectorAll('a')[1];
        voteDown.addEventListener('click', () => {
            fetch('http://localhost:7777/video-request/vote', {
                method:'PUT',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id: _id,
                    vote_type: 'downs'
                })
            })
            .then(result => result.json())
            .then(votes => {
                voteScore.innerHTML = votes.ups - votes.downs;
                
                // this updates the sorting list
                videoRequestsList = videoRequestsList.map(videoRequest => {
                    if (videoRequest._id === _id){
                        return {
                            ...videoRequest,
                            votes
                        };
                    }
                    return videoRequest;
                });

                // resorting the requests
                addRequestsToPageWithSort(videoRequestsList);
            });

        });
    
    return videoCard;
};

document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.querySelector('#videoRequestForm');
    const newFirst = document.querySelector('#newFirst');
    const topVotedFirst = document.querySelector('#topVotedFirst');
    const searchField = document.querySelector('#searchField');
    const warningMessage = document.querySelector('#warningMessage');

    newFirst.addEventListener('click', () => {
        if(newFirst.classList.contains('active')){
            return ;
        };
        topVotedFirst.classList.remove('active');
        newFirst.classList.add('active');

        // sorting the requests and adding them to the page
        addRequestsToPageWithSort(videoRequestsList);

    });

    topVotedFirst.addEventListener('click', () => {
        if(topVotedFirst.classList.contains('active')){
            return ;
        };
        newFirst.classList.remove('active');
        topVotedFirst.classList.add('active');

        // sorting the requests and adding them to the page
        addRequestsToPageWithSort(videoRequestsList);
    })

    // getting the video requests
    fetch('http://localhost:7777/video-request')
        .then(result => result.json())
        .then(videoRequests => {
            videoRequestsList = videoRequests;

            addRequestsToPageWithSort(videoRequests);
        })

    videoForm.addEventListener('submit',(e) => {
        e.preventDefault();

        const videoFormElementsValues = Object.keys(videoForm.elements).map(key => videoForm.elements[key].value);
        const [author_name, author_email, topic_title, target_level, topic_details, expected_result] = videoFormElementsValues;

        // checking the fields validation
        for(field of [author_name, author_email, topic_title, target_level, topic_details]){
            if(field === ""){
                warningMessage.innerText = 'you must fill all the required fields';
                warningMessage.style.display = 'block';
                return ;
            };
        };

        // email field validation
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(author_email)) {
            warningMessage.innerText = 'you must enter a valid email';
            warningMessage.style.display = 'block';
            return ;
        }

        // making the warning message disappear in case it wasn't
        warningMessage.style.display = 'none';

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
        .then(res => res.json())
        .then(videoData => {
            videoRequestsList.push(videoData);
            addRequestsToPageWithSort(videoRequestsList);
        })
        
    });

    // I used keyup instead of change to make the change in real time and used it instead of keydown because
    // keydown gets the previous state of the object
    searchField.addEventListener('keyup',(e) => {
        addRequestsToPageWithSort(videoRequestsList);
    })


});