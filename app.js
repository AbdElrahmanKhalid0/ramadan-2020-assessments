let videoRequestsList;

/**
 * 
 * @param {Array} requestsArray
 */

const addRequestsToPageWithSort = (requestsArray,requestsListElement,isSuperUser) => {
    const requestsList = requestsListElement ? requestsListElement : document.querySelector('#listOfRequests');
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
        const videoRequestCard = getCard(videoRequest,isSuperUser);
        requestsList.appendChild(videoRequestCard);
    });
}

const getCard = ({topic_title,topic_details,expected_result,votes,status,author_name,submit_date,target_level,_id,video_ref},isSuperUser) => {
    const videoCard = document.createElement('div');
    videoCard.classList.add('card','mb-3');

    // super user request card
    if(isSuperUser){
        videoCard.innerHTML = 
        `<div class="card-header d-flex flex-row justify-content-between">
            <select
                class="form-control col-2 status-change"
                name="status"
                placeholder="Enter the video Status"
            >
                <option value="new" ${status === 'new' ? 'selected' : ''}>new</option>
                <option value="planned" ${status === 'planned' ? 'selected' : ''}>planned</option>
                <option value="done" ${status === 'done' ? 'selected' : ''}>done</option>
            </select>
            ${status === 'done' ? `
            <form id="doneVideoForm${_id}" class="col-8">
                <div class="input-group">
                    <input type="text" name="videoUrl" class="form-control" placeholder="Enter Video Url" aria-label="Enter the done video link" ${video_ref.link ? `value="${video_ref.link}" disabled` : ''}>
                    ${!video_ref.link ? `
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="submit">save</button>
                    </div>
                    ` : ''}
                </div>
            </form>
            ` : ''}
            <button id="deleteRequest" class="btn btn-danger col-1">delete</button>
        </div>
        <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
            <h3>${topic_title}</h3>
            <p class="text-muted mb-2">${topic_details}</p>
            <p class="mb-0 text-muted">
                ${expected_result && `<strong>Expected results:</strong> ${expected_result}`}
            </p>
            </div>
            <div class="d-flex flex-column text-center voting-section">
            <a class="btn btn-link text-danger">🔺</a>
            <h3>${votes.ups - votes.downs}</h3>
            <a class="btn btn-link text-danger">🔻</a>
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

        videoCard.querySelector('.status-change').addEventListener('change',e => {
            fetch('http://localhost:7777/video-request',{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id:_id,
                    status: e.target.value
                })
            }).then(res => res.json()).then(videoRequestData => {
                videoRequestsList = videoRequestsList.map(videoRequest => {
                    if(videoRequest._id === videoRequestData._id){
                        return videoRequestData;
                    }
                    return videoRequest;
                })
                
                addRequestsToPageWithSort(videoRequestsList,document.querySelector('#hero-container > #listOfRequests'),true);
            })
        });

        if(status === 'done') {
            videoCard.querySelector(`#doneVideoForm${_id}`).addEventListener('submit',e => {
                e.preventDefault();

                const videoUrlElm = e.target.querySelector('[name=videoUrl]')
                const videoUrl = e.target.querySelector('[name=videoUrl]').value
                
                if(!videoUrl){
                    videoUrlElm.classList.add('is-invalid')
                    videoUrlElm.oninput = () => {videoUrlElm.classList.remove('is-invalid')}
                    return;
                }

                fetch('http://localhost:7777/video-request',{
                    method:'PUT',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({
                        id:_id,
                        status: 'done',
                        video_link: videoUrl
                    })
                }).then(res => res.json()).then(videoRequestData => {
                    videoRequestsList = videoRequestsList.map(videoRequest => {
                        if(videoRequest._id === videoRequestData._id){
                            return videoRequestData;
                        }
                        return videoRequest;
                    })
                    
                    addRequestsToPageWithSort(videoRequestsList,document.querySelector('#hero-container > #listOfRequests'),true);
                })
            })
        }

        return videoCard;
    }

    videoCard.innerHTML = 
        `<div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
            <h3>${topic_title}</h3>
            <p class="text-muted mb-2">${topic_details}</p>
            <p class="mb-0 text-muted">
                ${expected_result && `<strong>Expected results:</strong> ${expected_result}`}
            </p>
            </div>
            <div class="d-flex flex-column text-center voting-section">
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

        if(!canUserVoteOnVideoRequest(_id,location.search.replace('?id=',''))){
            videoCard.querySelector('.voting-section').style.color = 'grey';
        };

        voteUp = videoCard.querySelectorAll('a')[0];
        voteUp.addEventListener('click', () => {
            // not voting if the user already voted
            if(!canUserVoteOnVideoRequest(_id,location.search.replace('?id=',''))){
                return;
            };

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

                // the user voted this post
                userVotedOnVideoRequest(_id,location.search.replace('?id=',''))
            });

        });
        
        voteDown = videoCard.querySelectorAll('a')[1];
        voteDown.addEventListener('click', () => {
            // not voting if the user already voted
            if(!canUserVoteOnVideoRequest(_id,location.search.replace('?id=',''))){
                return;
            };

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

                // the user voted this post
                userVotedOnVideoRequest(_id,location.search.replace('?id=',''))
            });

        });
    
    return videoCard;
};

const userVotedOnVideoRequest = (requestId,userId) => {
    fetch('http://localhost:7777/video-request/user-vote',{
        method:'PUT',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            id:requestId,
            userId
        })
    }).then(res => res.json()).then(videoRequestData => {
        videoRequestsList = videoRequestsList.map(videoRequest => {
            if(videoRequest._id === requestId){
                return videoRequestData;
            }
            return videoRequest;
        })
        // sorting the requests list and adding it to the page after modifying it
        addRequestsToPageWithSort(videoRequestsList);
    })
}

const canUserVoteOnVideoRequest = (requestId,userId) => {
    wantedVideoRequest = videoRequestsList.find(videoRequest => {
        return videoRequest._id === requestId;
    });

    // returns false if the user has already voted this post and true if hasn't
    return !wantedVideoRequest.voted_by.includes(userId);
}

document.addEventListener('DOMContentLoaded', () => {
    let author_name = localStorage.author_name ? localStorage.author_name : null;
    let author_email = localStorage.author_email ? localStorage.author_email : null;
    const loginForm = document.querySelector('#loginForm');
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
        const [topic_title, target_level, topic_details, expected_result] = videoFormElementsValues;

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

    searchField.addEventListener('input',() => {
        addRequestsToPageWithSort(videoRequestsList);
    })

    // login form

    const goHomeOrHero = () => {
        if(location.search.replace('?id=','') === '5ebb8e40d66341c724ab2707'){
            console.log('you are our hero');
            document.querySelector('#home-container').style.display = 'none';
            document.querySelector('#login-container').style.display = 'none';
            document.querySelector('#hero-container').style.display = 'block';
            
            // fetching the data if there is no list stored
            if(!videoRequestsList){
                fetch('http://localhost:7777/video-request')
                .then(result => result.json())
                .then(videoRequests => {
                    videoRequestsList = videoRequests;
        
                    addRequestsToPageWithSort(videoRequestsList,document.querySelector('#hero-container > #listOfRequests'),true);
                })
            } else {
                addRequestsToPageWithSort(videoRequestsList,document.querySelector('#hero-container > #listOfRequests'),true);
            }
            
            return;
        };
        document.querySelector('#home-container').style.display = 'block';
        document.querySelector('#login-container').style.display = 'none';
        document.querySelector('#hero-container').style.display = 'none';
    }
    const goLogin = () => {
        document.querySelector('#home-container').style.display = 'none';
        document.querySelector('#login-container').style.display = 'block';
        document.querySelector('#hero-container').style.display = 'none';
    }

    
    if(location.search){
        goHomeOrHero()
    }

    loginForm.addEventListener('submit',(e) => {
        e.preventDefault();
        
        const loginFormElementsValues = Object.keys(loginForm.elements).map(key => loginForm.elements[key].value);
        const [login_author_name, login_author_email] = loginFormElementsValues;

        const author_name_elm = document.querySelector('input[name=author_name]');
        const author_email_elm = document.querySelector('input[name=author_email]');
        let stop = false;
    
        for (input_elm of [author_name_elm,author_email_elm]){
            if(!input_elm.value || (input_elm.type === "email" && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input_elm.value))) {
                input_elm.classList.add('is-invalid')
                stop = true
            }
            input_elm.oninput = function(e) {
                e.target.classList.remove('is-invalid')
            }
        }
        
        if (stop){return};

        fetch('http://localhost:7777/users/login',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({
                author_name:login_author_name,
                author_email:login_author_email
            })
        })
        .then(res => res.json())
        .then(user => {
            author_name = user.author_name;
            author_email = user.author_email;

            localStorage.author_name = user.author_name;
            localStorage.author_email = user.author_email;

            history.pushState({
                id:user._id
            },'Home || Semicolon',`${location.origin}/?id=${user._id}`);
            document.title = 'Home || Semicolon';

            goHomeOrHero()
        })
    })
    
    window.addEventListener('popstate',() => {
        if(!location.search){
            goLogin()
        } else {
            goHomeOrHero()
        }
        addRequestsToPageWithSort(videoRequestsList);
        
    })

    // suber user capabilities
    if(location.search.replace('?id=','') === '5ebb8e40d66341c724ab2707'){
        
    }
});