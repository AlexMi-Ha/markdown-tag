
function handleAllMarkdownTags() {
    const markdownElements = document.getElementsByTagName('markdown');
    for(const md of markdownElements) {
        renderMarkdownElement(md,md);
    }
}

function renderMarkdownElement(inputElement, outputElement) {
    renderMarkdownStringToElement(inputElement.innerHTML, outputElement);
}

function renderMarkdownStringToElement(mdString, outputElement) {
    // TODO: sanitize
    outputElement.innerHTML = markdownParse(mdString);
    // make elements functional
    // code copy
    const copyButtons = outputElement.querySelectorAll('.codeblock .copy-code');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const parent = this.parentElement;
            navigator.clipboard.writeText(parent.innerText.replace(/\n{3,}/gm, '\n\n'));
            parent.setAttribute('data-copied', 'true');
            parent.addEventListener('mouseleave', function(e) {
                this.setAttribute('data-copied', 'false');
            })
        });
    });
}

function markdownParse(mdString) {
    let lineArr = mdString.split('\n');
    let parsed = "";
    for(const line of lineArr) {
        parsed += line+ "\n";
    }
    for(const rule of rules) {
        parsed = parsed.replaceAll(rule[0], rule[1]);
    }
    // TODO: sanitize
    return parsed;
}


// IMPORTANT: Execute in order
const rules = [
    //bold, italic, deleted
    [/[\*\_]{2}([^\*\_\n]+)[\*\_]{2}/g, '<b>$1</b>'],
    [/[\*\_]{1}([^\*\_\n]+)[\*\_]{1}/g, '<i>$1</i>'],
    [/[\~]{2}([^\~\n]+)[\~]{2}/g, '<del>$1</del>'],

    //sub, superscript
    [/\~([^\~]+)\~/g, '<sub>$1</sub>'],
    [/\^([^\^]+)\^/g, '<sup>$1</sup>'],
    
    // highlight
    [/[\=]{2}([^\=]+)[\=]{2}/g, '<mark>$1</mark>'],
    
    //h
    [/^\s*[\#]{6}(.+)/gm, e => getIddHeading('h6', e)],
    [/^\s*[\#]{5}(.+)/gm, e => getIddHeading('h5', e)],
    [/^\s*[\#]{4}(.+)/gm, e => getIddHeading('h4', e)],
    [/^\s*[\#]{3}(.+)/gm, e => getIddHeading('h3', e)],
    [/^\s*[\#]{2}(.+)/gm, e => getIddHeading('h2', e)],
    [/^\s*[\#]{1}(.+)/gm, e => getIddHeading('h1', e)],

    //h v2
    [/^(.+)\n\s*\=+/gm, e => getIddHeading('h1', e.split('\n')[0])],
    [/^(.+)\n\s*\-+/gm, e => getIddHeading('h2', e.split('\n')[0])],


    // TODO: Subpoints
    // TODO: maybe with multiple ** for more indentation
    //ul
    [/^\s*\n\s*[\*-]/gm, '\n<ul>\n*'],
    [/^\s*([\*-].+)\s*\n\s*([^\*\s-])/gm, '$1\n</ul>\n\n$2'],
    [/^\s*[\*-](.+)/gm, '<li>$1</li>'],

    //ol
    [/^\s*\n\s*\d\./gm, '\n<ol>\n1.'],
    [/^\s*(\d\..+)\s*\n\s*([^\d\.\s])/gm, '$1\n</ol>\n\n$2'],
    [/^\s*\d\.(.+)/gm, '<li>$1</li>'],

    // TODO: support multiline blockquotes
    // TODO: support multilevel blockquotes
    //blockquote
    [/^\s*(?:\>|\&gt;)(.+)/gm, '\n<blockquote>$1</blockquote>'],


    //images
    [/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />'],

    //links
    [/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>'],
    

    //pre
    [/^\s*\n\s*\`\`\`(([^\s]+))?/gm, '\n<pre class="codeblock $2" data-copied="false"><button class="copy-code"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="copied-icon"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="copy-icon"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg></button>'],
    [/^\s*\`\`\`\s*\n/gm, '</pre>\n\n'],

    //code
    [/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>'],

    //table
    [/^\s*\S.*[|].*\n[-| :]+\n(?:.*[|].*\n?)*$/gm, function(table) {
        const rows = table.split('\n');
        rows.shift();
        let tableHtml = '\n<table><tr>';
        for(const headerCell of rows.shift().trim().split('|').slice(1,-1)) {
            tableHtml += '<th>' + headerCell + '</th>';
        }
        tableHtml += '</tr>';
        rows.shift();
        for(const row of rows) {
            if(!row)
                break;
            tableHtml += '<tr>'
            for(const cell of row.trim().split('|').slice(1,-1)) {
                tableHtml += '<td>' + cell + '</td>'
            }
            tableHtml +='</tr>';
        }
        tableHtml += '</table>';
        return tableHtml;
    }],

    // hr
    [/^\s*-{3,}/g, '\n<hr />'],

    // TODO: fix paragraph grammar to include linebreaks
    //p
    [/^(([\t ]*)([^\s\n])(.*)(\n)?)+/gm, function(m){
        console.log(m)
        return  /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
    }],

    // fix pre
    [/(\<pre.+\>)\s*\n(?:\<p\>(.+)\<\/p\>\n?)+/gm, function(e) {
        return e.replaceAll(/\<\/?p\>/g, '').replaceAll('\n', '');
    }]
]


function getIddHeading(headingType, str) {
    let id = str.replaceAll('#','').trim().toLowerCase().replaceAll(' ', '-');
    let anchor = '<a class="header-anchor" href="'+window.location.origin + window.location.pathname+'#'+id+'"><svg class="header-anchor-location-icon" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg></a>'
    return '\n<'+headingType+' id="'+id+'" class="header-text">'+ anchor + str.replaceAll('#', '').trim() + '</'+headingType+'>';
}

handleAllMarkdownTags();