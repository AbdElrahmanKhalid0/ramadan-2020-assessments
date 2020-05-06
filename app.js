document.addEventListener('DOMContentLoaded', () => {
    const videoForm = document.querySelector('#videoRequestForm');

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