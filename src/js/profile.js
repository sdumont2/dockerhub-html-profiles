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
        fetch(url).then(function(res) {
            return res.json();
        }).then(function(data) {
            callback(data);
        });
    }

    async function syncRequest(url) {
         var res = await fetch(url);
         var data = await res.json();

        return data;
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
        request(url, async function(data) {
            data = data || {};
            var empty = '0';

            data.username = user;
            data.full_name = data.full_name || user;

            var allRepoData = await syncRequest(reposUrl);
            
            if (allRepoData) {
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
            } else {
                data.count = empty;
                data.total_pull_count = empty;
                data.total_star_count = empty;
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