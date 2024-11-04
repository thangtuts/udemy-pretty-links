(async function() {
    'use strict';

    console.log("Pretty script running...");

    function waitForElement(selector) {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else {
                const observer = new MutationObserver((mutations, me) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        resolve(element);
                        me.disconnect();
                    }
                });
                observer.observe(document, {
                    childList: true,
                    subtree: true
                });
            }
        });
    }

    async function fetchCourseLinks() {
        const courseDivs = document.querySelectorAll('.my-courses__course-card-grid');

        const linksArray = [];

        courseDivs.forEach(div => {
            const links = div.querySelectorAll('a');
            links.forEach(link => {
                linksArray.push({
                    href: link.href
                });
            });
        });

        return linksArray;
    }

    await waitForElement('.my-courses__course-card-grid');

    const courseLinks = await fetchCourseLinks();

    async function fetchRedirectUrl(url) {
        const response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow'
        });
        return response.url;
    }

    const courseLinksWithRedirects = await Promise.all(courseLinks.map(async (course) => {
        const redirectUrl = await fetchRedirectUrl(course.href);
        const regexRedirectUrl = /(https:\/\/www\.udemy\.com\/course\/[^\/]+)/;
        const cleanRedirectUrl = redirectUrl.match(regexRedirectUrl)[0];

        return {
            cleanRedirectUrl
        };
    }));

    console.log(courseLinksWithRedirects);

    const downloadLink = document.createElement('a');
    downloadLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(courseLinksWithRedirects.map(course => course.cleanRedirectUrl).join('\n'));
    downloadLink.download = 'udemy-course-links.txt';
    downloadLink.click();

})();