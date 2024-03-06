let downloadUrlArr = [];
const loadingDOM = document.getElementById('loading');
const searchDOM = document.getElementById('search');

document.getElementById('search').addEventListener('click', function() {
  const keyword = document.getElementById('keyword').value.trim();
  const year = document.getElementById('year').value.trim();

  if (!keyword) {
    alert('请输入搜索关键词');
    return;
  }

  // year支持格式: 数字 / 数字- / -数字 / 数字-数字
  const regex = /^\d*-?\d*$/;
  if (!regex.test(year)) {
    alert('year支持格式: 数字 / 数字- / -数字 / 数字-数字');
    return;
  }

  loadingDOM.style.display = "block";
  searchDOM.style.display = "none";

  fetchPapers(keyword, year);
});

function fetchPapers(keyword, year) {
  const params = {
    contentScriptQuery: "fetchSemanticScholar", 
    keyword, year
  };
  chrome.runtime.sendMessage(
    params,
    response => {
      loadingDOM.style.display = "none";
      searchDOM.style.display = "block";
      displayResults(response.result);
    }
  );
}

function displayResults(data) {
  // 先reset
  downloadUrlArr = [];
  const total = data.total || 0;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // 清除旧结果
  const downloadButton = document.getElementById('download');
  downloadButton.style.display = 'none';

  if (data.error) {
    alert('出错了：' + data.error);
    return;
  }

  data && data.data && data.data.forEach(paper => {
    if (paper.isOpenAccess && paper.openAccessPdf && paper.openAccessPdf.url) {
      downloadUrlArr.push(paper.openAccessPdf.url);
    }
  });

  const paperElement = document.createElement('div');
  paperElement.innerHTML = `共 ${total} 篇论文，其中有下载权限的 ${downloadUrlArr.length} 篇`;
  resultsDiv.appendChild(paperElement);

  if (total > 0) {
    downloadButton.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const downloadButton = document.getElementById('download');
  downloadButton.addEventListener('click', downloadPapers);
});

function downloadPapers() {
  chrome.runtime.sendMessage({action: "downloadPapers", links: downloadUrlArr});
}

