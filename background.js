chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.contentScriptQuery == "fetchSemanticScholar") {
    const query = request.keyword;
    const year = request.year;
    const params = `query=${encodeURIComponent(query)}&year=${year}&fields=url,isOpenAccess,openAccessPdf`;
    const apiUrl = `https://api.semanticscholar.org/graph/v1/paper/search/bulk?${params}`;

    fetch(apiUrl, {
      headers: {
        "x-api-key": "your token"
      }
    }).then(response => response.json())
      .then(data => sendResponse({result: data}))
      .catch(error => alert('出错了：' + error));
    
    return true;  // Will respond asynchronously.
  }

  if (request.action == "downloadPapers") {
    request.links.forEach(link => {
      chrome.downloads.download({
        url: link,
        conflictAction: 'uniquify', // 如果存在同名文件，自动重命名
        // saveAs: true
      });
    });
  }
});
