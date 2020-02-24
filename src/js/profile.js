function getQueryParams() {
    var query = window.location.search.substring(1);
    var params = query.split('&');
    var queryParamsArr = {};

    for (var i = 0; i < params.length; i++) {
        var pair = params[i].split('=');
        queryParamsArr[pair[0]] = decodeURIComponent(pair[1]);
    }
    return queryParamsArr;
}

var queryParams = getQueryParams();

(function(d) {
    var apiUrl = 'https://test-worker.corsbypass.workers.dev/proxy?apiurl=https://hub.docker.com/v2/';

    function checkCache(url) {
        var cache = cacheData(url);
        if (cache && cache._timestamp) {
            // cache in 15s
            if (new Date().valueOf() - cache._timestamp < 15000) {
                return cache;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    function cacheData(url, data) {
        try {
            if (window.localStorage) {
                if (data) {
                    data._timestamp = new Date().valueOf();
                    localStorage[url] = JSON.stringify(data);
                } else {
                    var ret = localStorage[url];
                    if (ret) {
                        return JSON.parse(ret);
                    }
                    return null;
                }
            }
        } catch (e) {
            console.log("DockerHub Profile Error caching data into local browser storage: " + e);
        }
    }

    function getValue(data, key) {
        var ret = data;
        var bits = key.split('.');
        for (var j = 0; j < bits.length; j++) {
            if (ret) {
                ret = ret[bits[j]];
            } else {
                break;
            }
        }
        if (ret === undefined || ret === null) {
            return '';
        }
        return ret;
    }

    function getPopulatedThemeHTML(theme, data) {
        var t = d.getElementById(theme + '-theme');
        var regex = /{([^}]+)}/g;
        var text = t.innerHTML;
        var m = text.match(regex);
        for (var i = 0; i < m.length; i++) {
            text = text.replace(m[i], getValue(data, m[i].slice(1, -1)));
        }
        return text;
    }

    function request(url, callback) {
        var cache = checkCache(url);
        if (cache != null) callback(cache);

        fetch(url).then(function(res) {
            return res.json();
        }).then(function(data) {
            callback(data);
        });
    }

    async function asyncRequest(url) {
        var resultData = {};
        var cache = checkCache(url);
        if (cache != null) return cache;
        const response = await fetch(url);
        resultData = await response.json();
        return resultData;
    }

    function profilePoster(card, identity) {
        var links = card.getElementsByTagName('a');
        for (i = 0; i < links.length; i++) {
            (function(link) {
                link.target = '_' + (queryParams.target || 'top');
            })(links[i]);
        }
        d.body.appendChild(card);
        d.body.className = 'ready';
        if (parent !== self && parent.postMessage) {
            var height = Math.max(
                d.body.scrollHeight,
                d.documentElement.scrollHeight,
                d.body.offsetHeight,
                d.documentElement.offsetHeight,
                d.body.clientHeight,
                d.documentElement.clientHeight
            );
            parent.postMessage({
                height: height,
                sender: queryParams.identity || '*'
            }, '*');
        }
    }

    function getUserProfile(user) {
        var url = apiUrl + 'users/' + user + '/';
        var reposUrl = apiUrl + 'repositories/' + user + '/';
        request(url, function(data) {
            data = data || {};
            var empty = '0';
            if (data) {
                cacheData(url, data);
            }

            data.username = user;
            data.full_name = data.full_name || user;

            var allRepoData = asyncRequest(reposUrl);
            if (allRepoData) {
                cacheData(reposUrl, allRepoData);
                data.count = allRepoData.count || empty;
                var pullCount = 0;
                var starCount = 0;
                if (allRepoData.results) {
                    for (var r in allRepoData.results) {
                        pullCount += r.pull_count;
                        starCount += r.star_count;
                    }
                }
                data.total_pull_count = pullCount || empty;
                data.total_star_count = starCount || empty;
            }

            var profile = d.createElement('div');
            profile.className = 'dockerhub-profile default-theme';
            profile.innerHTML = getPopulatedThemeHTML('default', data);
            profilePoster(profile);
        });
    }

    if (queryParams.user) {
        getUserProfile(queryParams.user);
    }

})(document);