
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
        parsed = parsed.replace(rule[0], rule[1]);
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

    // TODO: Subpoints
    //ul
    /*[/^\s*\n[\*-]/gm, '<ul>\n*'],
    [/^([\*-].+)\s*\n(\s*[^\*-])/gm, '$1\n</ul>\n\n$2'],
    [/^\s*[\*-](.+)/gm, '<li>$1</li>'],*/
    
    [/^\s*\n(\s*[-*+].+\s*\n)(?:.+\n)*/gm, function(listMd) {
        const lines = listMd.split('\n');
        let html = '';
        let startTab = lines[1].split(/[^\t]/)[0].length;
        let ulOpened = 0;
        let liOpened = 0;
        for(let i = 1; i < lines.length; ++i) {
            if(lines[i].trim().match(/[*+-].*/) != null) {
                if(lines[i-1].length - lines[i-1].trimStart().length < lines[i].length - lines[i].trimStart().length) {
                    ulOpened++;
                    html += '<ul>'
                } else if(lines[i-1].length - lines[i-1].trimStart().length > lines[i].length - lines[i].trimStart().length) {
                    const tabBefore = lines[i-1].split(/[^\t]/)[0].length;
                    const tabHere = lines[i].split(/[^\t]/)[0].length;
                    const diff = Math.max(tabBefore - tabHere, 1);
                    liOpened -= diff
                    html += '</li>'.repeat(diff);
                    ulOpened--;
                    html += '</ul>';
                } else {
                    liOpened--;
                    html += '</li>'
                }
                liOpened++;
                html += '<li>' + lines[i].trim().substring(1);
            }
        }
        html += '</li>'.repeat(Math.max(liOpened,0));
        html += '</ul>'.repeat(Math.max(ulOpened, 0));
        console.log('Markdown', listMd);
        console.log("Html",html);
        return html;
    }],

    //ol
    [/^\s*\n\d\./gm, '<ol>\n1.'],
    [/^(\d\..+)\s*\n([^\d\.])/gm, '$1\n</ol>\n\n$2'],
    [/^\d\.(.+)/gm, '<li>$1</li>'],

    // TODO: support multiline blockquotes
    // TODO: support multilevel blockquotes
    //blockquote
    [/^(?:\>|\&gt;)(.+)/gm, '<blockquote>$1</blockquote>'],

    //h
    [/[\#]{6}(.+)/g, '<h6>$1</h6>'],
    [/[\#]{5}(.+)/g, '<h5>$1</h5>'],
    [/[\#]{4}(.+)/g, '<h4>$1</h4>'],
    [/[\#]{3}(.+)/g, '<h3>$1</h3>'],
    [/[\#]{2}(.+)/g, '<h2>$1</h2>'],
    [/[\#]{1}(.+)/g, '<h1>$1</h1>'],

    //h v2
    [/^(.+)\n\=+/gm, '<h1>$1</h1>'],
    [/^(.+)\n\-+/gm, '<h2>$1</h2>'],

    //images
    [/\!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />'],

    //links
    [/[\[]{1}([^\]]+)[\]]{1}[\(]{1}([^\)\"]+)(\"(.+)\")?[\)]{1}/g, '<a href="$2" title="$4">$1</a>'],
    

    //pre
    [/^\s*\n\`\`\`(([^\s]+))?/gm, '<pre class="codeblock $2" data-copied="false"><button class="copy-code"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="copied-icon"><path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"></path></svg><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="copy-icon"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"></path><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"></path></svg></button>'],
    [/^\`\`\`\s*\n/gm, '</pre>\n\n'],

    //code
    [/[\`]{1}([^\`]+)[\`]{1}/g, '<code>$1</code>'],

    //table
    [/^\s*\S.*[|].*\n[-| :]+\n(?:.*[|].*\n?)*$/gm, function(table) {
        const rows = table.split('\n');
        rows.shift();
        let tableHtml = '<table><tr>';
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
    [/^-{3,}/g, '<hr />'],

    // TODO: fix paragraph grammar to include linebreaks
    //p
    [/^\s*(\n)?(.+)/gm, function(m){
        return  /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
    }],

    // fix pre
    [/(\<pre.+\>)\s*\n\<p\>(.+)\<\/p\>/gm, '$1$2']
]

handleAllMarkdownTags();