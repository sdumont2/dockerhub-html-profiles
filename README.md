# dockerhub-html-profiles

A HTML Embeddable Docker Hub Profile.  

***I Have No Affiliation with Docker. This is just made for fun***  

I made this myself for my own website https://dumontsean.com  

Feel free to use this for yourself (directions below).  

## How to use

```html
<div class="dockerhub-profile" profile-user="sdumont92"></div>
<script src="https://cdn.jsdelivr.net/gh/sdumont2/dockerhub-html-profiles@latest/dist/tool.js"></script>
```

## Parameters to set

To set a parameter in the div, use the attribute `profile-{attribute}="value"`, so for example `profile-width="500"`.

- user **(required)**: Docker Hub username
- width (optional): The width you'd like to set. Defaults to 400.
- height (optional): The height you'd like to set (must be >= 400). Defaults to 400.

## Potential Issues

- Docker Hub has removed documentation to their user APIs, so they could restrict access at anytime, effectively rendering this tool useless.  

- I am having to use a CORs bypass proxy ([self made](https://github.com/sdumont2/cloudflare-worker-corsbypass)), but there's a limit to the amount of requests each month. If that limit is reached, then the tool won't work.

## Roadmap

- More themes (The framework is there)  
- Repositories (Basic Framework is set up)  
- Improved Sizing customizations for avatars/gravatars  
- More accurate counting for repositories total star/pull counts (currently only grabs first 25 repos)  
- Custom CSS Support  
- Custom Parameter Support  
- Custom HTML Support  
